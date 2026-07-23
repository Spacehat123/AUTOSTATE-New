import { inngest } from '../client'
import { prisma } from '@autostate/database'
import { createClient } from '@supabase/supabase-js'
import { parseExcelFile, parsePaymentFile } from '@autostate/importer'
import { generateTasksForCompany } from '@autostate/ai'

function getSupabase() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export const processImport = inngest.createFunction(
  { id: 'process-import', name: 'Process File Import', triggers: [{ event: 'import.file.uploaded' }] },
  async ({ event, step }) => {
    const { jobId, filePath, companyId, type } = event.data

    await step.run('update-job-processing', async () => {
      await prisma.importJob.update({
        where: { id: jobId },
        data: { status: 'PROCESSING' }
      })
    })

    let processedStats = { processedRows: 0, errors: [] as any[] }

    if (type === 'INVOICE') {
      const parsedData = await step.run('download-and-parse', async () => {
        const { data, error } = await getSupabase().storage.from('imports').download(filePath)
        if (error || !data) {
          throw new Error('Failed to download file from Supabase: ' + error?.message)
        }
        const arrayBuffer = await data.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        return parseExcelFile(buffer)
      })

      const { customers, invoices, errors } = parsedData

      await step.run('update-job-total-rows', async () => {
        await prisma.importJob.update({
          where: { id: jobId },
          data: { totalRows: customers.length + invoices.length }
        })
      })

      // Upsert Customers and Invoices
      processedStats = await step.run('upsert-data', async () => {
        let processedRows = 0
        const customerMap = new Map<string, string>() // name -> id

        for (const c of customers) {
          let existing = null
          if (c.phone) {
            existing = await prisma.customer.findFirst({
              where: { companyId, phone: c.phone }
            })
          }
          if (!existing && c.gst) {
            existing = await prisma.customer.findFirst({
              where: { companyId, gstNumber: c.gst }
            })
          }
          if (!existing) {
            existing = await prisma.customer.findFirst({
              where: { companyId, name: c.name }
            })
          }

          let savedCustomer
          if (existing) {
            savedCustomer = await prisma.customer.update({
              where: { id: existing.id },
              data: {
                name: c.name,
                phone: c.phone || existing.phone,
                email: c.email || existing.email,
                gstNumber: c.gst || existing.gstNumber
              }
            })
          } else {
            savedCustomer = await prisma.customer.create({
              data: {
                companyId,
                name: c.name,
                phone: c.phone,
                email: c.email,
                gstNumber: c.gst
              }
            })
          }
          
          customerMap.set(c.name, savedCustomer.id)
          processedRows++
        }

        for (const inv of invoices) {
          const customerId = customerMap.get(inv.customerName)
          if (!customerId) {
            errors.push({ row: 0, message: `Customer not found for invoice: ${inv.invoiceNumber}` })
            continue
          }

          await prisma.invoice.upsert({
            where: {
              customerId_invoiceNumber: {
                customerId,
                invoiceNumber: inv.invoiceNumber
              }
            },
            update: {
              amount: inv.amount,
              outstandingAmount: inv.outstandingAmount,
              issueDate: new Date(inv.issueDate),
              dueDate: new Date(inv.dueDate),
              status: inv.status as any
            },
            create: {
              customerId,
              invoiceNumber: inv.invoiceNumber,
              amount: inv.amount,
              outstandingAmount: inv.outstandingAmount,
              issueDate: new Date(inv.issueDate),
              dueDate: new Date(inv.dueDate),
              status: inv.status as any
            }
          })
          processedRows++
        }

        return { processedRows, errors }
      })

      await step.run('generate-tasks', async () => {
        await generateTasksForCompany(companyId)
      })
    } else if (type === 'PAYMENT') {
      const parsedData = await step.run('download-and-parse-payment', async () => {
        const { data, error } = await getSupabase().storage.from('imports').download(filePath)
        if (error || !data) {
          throw new Error('Failed to download file from Supabase: ' + error?.message)
        }
        const arrayBuffer = await data.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        return parsePaymentFile(buffer)
      })

      const { payments, errors } = parsedData

      await step.run('update-job-total-rows-payment', async () => {
        await prisma.importJob.update({
          where: { id: jobId },
          data: { totalRows: payments.length }
        })
      })

      processedStats = await step.run('process-payments', async () => {
        let processedRows = 0

        for (const payment of payments) {
          const invoice = await prisma.invoice.findFirst({
            where: {
              invoiceNumber: payment.invoiceNumber,
              customer: { companyId }
            },
            include: { customer: true }
          })

          if (!invoice) {
            errors.push({ row: 0, message: `Skipped: Unknown invoice number ${payment.invoiceNumber}` })
            continue
          }

          if (payment.currency && payment.currency !== invoice.currency) {
            errors.push({ row: 0, message: `Currency mismatch: Expected ${invoice.currency}, got ${payment.currency}` })
            continue
          }

          const outstandingAmount = Number(invoice.outstandingAmount)
          let allocationAmount = payment.amount
          let overpaymentAmount = 0

          if (payment.amount > outstandingAmount) {
            allocationAmount = outstandingAmount
            overpaymentAmount = payment.amount - outstandingAmount
          }

          try {
            await prisma.$transaction(async (tx) => {
              const idempotencyKey = payment.reference || `import-${Date.now()}-${Math.random().toString(36).substring(7)}`
  
              const createdPayment = await tx.payment.create({
                data: {
                  companyId,
                  amount: payment.amount,
                  receivedAt: payment.date,
                  reference: payment.reference,
                  idempotencyKey,
                  method: 'IMPORT'
                }
              })
  
              await tx.paymentAllocation.create({
                data: {
                  paymentId: createdPayment.id,
                  invoiceId: invoice.id,
                  amount: allocationAmount
                }
              })
  
              const newOutstandingAmount = outstandingAmount - allocationAmount
              await tx.invoice.update({
                where: { id: invoice.id },
                data: {
                  outstandingAmount: newOutstandingAmount,
                  status: newOutstandingAmount <= 0 ? 'PAID' : 'PARTIAL'
                }
              })
  
              if (overpaymentAmount > 0) {
                await tx.customer.update({
                  where: { id: invoice.customerId },
                  data: {
                    creditBalance: { increment: overpaymentAmount }
                  }
                })
              }
            })
          } catch (error: any) {
            if (error?.code === 'P2002') {
              errors.push({ row: 0, message: `Skipped: Duplicate payment reference ${payment.reference}` })
              continue
            }
            throw error
          }

          processedRows++
        }

        return { processedRows, errors }
      })
    }

    await step.run('complete-job', async () => {
      await prisma.importJob.update({
        where: { id: jobId },
        data: { 
          status: 'DONE',
          processedRows: processedStats.processedRows,
          errorLog: processedStats.errors.length > 0 ? JSON.stringify(processedStats.errors) : null
        }
      })
    })

    return { success: true }
  }
)
