import { inngest } from '../client'
import { prisma } from '@autostate/database'
import { createClient } from '@supabase/supabase-js'
import { parseExcelFile } from '@autostate/importer'
import { generateTasksForCompany } from '@autostate/ai'

function getSupabase() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export const processImport = (inngest.createFunction as any)(
  { id: 'process-import', name: 'Process File Import' },
  { event: 'import.file.uploaded' },
  async ({ event, step }: any) => {
    const { jobId, filePath, companyId } = event.data

    await step.run('update-job-processing', async () => {
      await prisma.importJob.update({
        where: { id: jobId },
        data: { status: 'PROCESSING' }
      })
    })

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
    const processedStats = await step.run('upsert-data', async () => {
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
