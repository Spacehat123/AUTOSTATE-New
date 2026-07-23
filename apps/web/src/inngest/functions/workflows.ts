import { inngest } from '../client'
import { prisma } from '@autostate/database'

export const evaluateDunningWorkflows = inngest.createFunction(
  { id: 'evaluate-dunning-workflows', name: 'Evaluate Dunning Workflows' },
  { cron: '0 * * * *' },
  async ({ step }) => {
    // 1. Fetch all active workflows with their steps
    const workflows = await step.run('fetch-active-workflows', async () => {
      return prisma.workflow.findMany({
        where: { isActive: true },
        include: { steps: { orderBy: { order: 'asc' } } }
      })
    })

    const results = []

    for (const workflow of workflows) {
      const result = await step.run(`process-workflow-${workflow.id}`, async () => {
        let processedCount = 0

        // Find open invoices for the company
        const invoices = await prisma.invoice.findMany({
          where: {
            customer: { companyId: workflow.companyId },
            status: { in: ['PENDING', 'OVERDUE', 'PARTIAL'] }
          },
          include: { customer: true }
        })

        const today = new Date()
        today.setHours(0, 0, 0, 0) // start of today

        for (const invoice of invoices) {
          const dueDate = new Date(invoice.dueDate)
          dueDate.setHours(0, 0, 0, 0)
          
          const msPerDay = 1000 * 60 * 60 * 24
          const daysPastDue = Math.round((today.getTime() - dueDate.getTime()) / msPerDay)

          for (const wfStep of workflow.steps) {
            if (wfStep.delayDays === daysPastDue) {
              // Action needed today for this step
              
              // Check enrollment
              let enrollment = await prisma.workflowEnrollment.findUnique({
                where: {
                  workflowId_invoiceId: {
                    workflowId: workflow.id,
                    invoiceId: invoice.id
                  }
                }
              })
              
              if (!enrollment) {
                enrollment = await prisma.workflowEnrollment.create({
                  data: {
                    workflowId: workflow.id,
                    invoiceId: invoice.id,
                    status: 'ACTIVE',
                    currentStepId: wfStep.id
                  }
                })
              } else {
                if (enrollment.status !== 'ACTIVE') continue
                
                await prisma.workflowEnrollment.update({
                  where: { id: enrollment.id },
                  data: { currentStepId: wfStep.id }
                })
              }

              // Execute step
              if (wfStep.type === 'TASK') {
                await prisma.task.create({
                  data: {
                    customerId: invoice.customerId,
                    taskType: 'FOLLOW_UP',
                    priority: 50,
                    reason: `Automated workflow step: ${workflow.name} - ${daysPastDue} days past due`,
                    dueDate: new Date(),
                    status: 'PENDING'
                  }
                })
              } else {
                // Mock message
                await prisma.message.create({
                  data: {
                    customerId: invoice.customerId,
                    type: wfStep.type === 'WHATSAPP' ? 'WHATSAPP' : 'EMAIL',
                    direction: 'OUTGOING',
                    content: wfStep.template || `Automated ${wfStep.type} reminder for invoice ${invoice.invoiceNumber}.`
                  }
                })
              }
              
              processedCount++
            }
          }
        }
        
        return { workflowId: workflow.id, processedCount }
      })
      results.push(result)
    }

    return { success: true, results }
  }
)
