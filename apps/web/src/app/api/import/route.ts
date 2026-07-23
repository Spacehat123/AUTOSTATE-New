import { NextRequest, NextResponse } from 'next/server'
import { InvoiceStatus, prisma } from '@autostate/database'
import { parseExcelFile, type ImportPreviewRow } from '@autostate/importer'
import { getCurrentUser } from '@/lib/auth'
import { requireAuthorizedUser, InsufficientRoleError, roleErrorResponse } from '@/lib/rbac'

export const dynamic = 'force-dynamic'

const MAX_FILE_SIZE = 10 * 1024 * 1024

function customerKey(name: string) {
  return name.trim().toLocaleLowerCase()
}

function invoiceKey(customerName: string, invoiceNumber: string) {
  return `${customerKey(customerName)}\u0000${invoiceNumber.trim()}`
}

function isPreviewRow(value: unknown): value is ImportPreviewRow {
  if (!value || typeof value !== 'object') return false
  const row = value as Record<string, unknown>
  return typeof row.customerName === 'string'
    && typeof row.invoiceNumber === 'string'
    && typeof row.amount === 'number'
    && typeof row.dueDate === 'string'
    && typeof row.issueDate === 'string'
    && Array.isArray(row.errors)
    && row.errors.length === 0
}

export async function GET() {
  const user = await getCurrentUser()

  try {
    requireAuthorizedUser(user)
  } catch (error) {
    if (error instanceof InsufficientRoleError) return roleErrorResponse()
    throw error
  }

  try {
    // user.db is the tenant-scoped client — automatically filters by companyId
    const jobs = await user.db.importJob.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    })
    return NextResponse.json(jobs)
  } catch (error) {
    console.error('[IMPORT_GET]', error)
    return NextResponse.json({ error: 'Unable to load import history' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()

  try {
    requireAuthorizedUser(user)
  } catch (error) {
    if (error instanceof InsufficientRoleError) return roleErrorResponse()
    throw error
  }

  const contentType = request.headers.get('content-type') || ''

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) return NextResponse.json({ error: 'Choose a CSV or XLSX file first' }, { status: 400 })
    if (!/\.(csv|xlsx)$/i.test(file.name)) return NextResponse.json({ error: 'Only .csv and .xlsx files are supported' }, { status: 400 })
    if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: 'Files must be 10 MB or smaller' }, { status: 413 })

    const parsed = parseExcelFile(Buffer.from(await file.arrayBuffer()))
    const validRows = parsed.rows.filter((row) => row.errors.length === 0)
    const customerNames = [...new Set(validRows.map((row) => row.customerName.trim()))]
    const customers = customerNames.length
      ? await prisma.customer.findMany({
          where: {
            companyId: user.companyId,
            OR: customerNames.map((name) => ({ name: { equals: name, mode: 'insensitive' as const } })),
          },
          select: { id: true, name: true },
        })
      : []
    const customerIds = customers.map((customer) => customer.id)
    const invoiceNumbers = [...new Set(validRows.map((row) => row.invoiceNumber.trim()))]
    const existingInvoices = customerIds.length && invoiceNumbers.length
      ? await prisma.invoice.findMany({
          where: { customerId: { in: customerIds }, invoiceNumber: { in: invoiceNumbers } },
          include: { customer: { select: { name: true } } },
        })
      : []
    const existingKeys = new Set(existingInvoices.map((invoice) => invoiceKey(invoice.customer.name, invoice.invoiceNumber)))
    const rows = parsed.rows.map((row) => ({ ...row, alreadyExists: existingKeys.has(invoiceKey(row.customerName, row.invoiceNumber)) }))
    return NextResponse.json({
      fileName: file.name,
      rows,
      errors: parsed.errors,
      validRows: validRows.length,
    })
  }

  let body: { fileName?: unknown; rows?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid import request' }, { status: 400 })
  }

  const rows = Array.isArray(body.rows) ? body.rows : []
  if (!rows.length || !rows.every(isPreviewRow)) {
    return NextResponse.json({ error: 'Fix validation problems before importing' }, { status: 400 })
  }

  const importRows = rows as ImportPreviewRow[]
  const job = await prisma.importJob.create({
    data: { companyId: user.companyId, fileName: typeof body.fileName === 'string' ? body.fileName : 'invoice-import', status: 'PROCESSING', totalRows: importRows.length },
  })

  try {
    const result = await prisma.$transaction(async (tx) => {
      const customerIds = new Map<string, string>()
      let customersCreated = 0
      let skippedAlreadyExists = 0
      let skippedDuplicates = 0
      const uniqueRows: ImportPreviewRow[] = []
      const fileInvoiceKeys = new Set<string>()

      for (const row of importRows) {
        const key = invoiceKey(row.customerName, row.invoiceNumber)
        if (fileInvoiceKeys.has(key)) {
          skippedDuplicates++
          continue
        }
        fileInvoiceKeys.add(key)
        uniqueRows.push(row)
      }

      for (const row of uniqueRows) {
        const key = customerKey(row.customerName)
        if (customerIds.has(key)) continue

        const existing = await tx.customer.findFirst({
          where: { companyId: user.companyId, name: { equals: row.customerName.trim(), mode: 'insensitive' } },
        })
        if (existing) {
          customerIds.set(key, existing.id)
          continue
        }

        const customer = await tx.customer.create({
          data: { companyId: user.companyId, name: row.customerName.trim(), phone: row.phone, email: row.email, gstNumber: row.gst },
        })
        customerIds.set(key, customer.id)
        customersCreated++
      }

      let importedInvoices = 0
      for (const row of uniqueRows) {
        const customerId = customerIds.get(customerKey(row.customerName))
        if (!customerId) throw new Error(`Could not resolve customer for row ${row.row}`)
        if (row.amount === null || row.dueDate === null) throw new Error(`Invalid value in row ${row.row}`)
        const dueDate = new Date(row.dueDate)
        const issueDate = new Date(row.issueDate)
        if (Number.isNaN(dueDate.getTime()) || Number.isNaN(issueDate.getTime())) throw new Error(`Invalid date in row ${row.row}`)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const status = dueDate < today ? InvoiceStatus.OVERDUE : InvoiceStatus.PENDING
        const existingInvoice = await tx.invoice.findUnique({
          where: { customerId_invoiceNumber: { customerId, invoiceNumber: row.invoiceNumber.trim() } },
          select: { id: true },
        })
        if (existingInvoice) {
          skippedAlreadyExists++
          continue
        }
        await tx.invoice.create({
          data: { customerId, invoiceNumber: row.invoiceNumber.trim(), amount: row.amount, outstandingAmount: row.amount, issueDate, dueDate, status },
        })
        importedInvoices++
      }
      return { customersCreated, importedInvoices, skippedAlreadyExists, skippedDuplicates }
    })

    const completedJob = await prisma.importJob.update({
      where: { id: job.id },
      data: { status: 'DONE', processedRows: result.importedInvoices + result.skippedAlreadyExists + result.skippedDuplicates },
    })
    return NextResponse.json({ job: completedJob, ...result, errors: 0 })
  } catch (error) {
    console.error('[IMPORT_POST]', error)
    await prisma.importJob.update({ where: { id: job.id }, data: { status: 'FAILED', errorLog: error instanceof Error ? error.message : 'Unknown import error' } })
    return NextResponse.json({ error: 'Import failed. No invoices were imported.' }, { status: 500 })
  }
}
