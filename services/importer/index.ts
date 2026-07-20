import * as xlsx from 'xlsx'

export interface ImportPreviewRow {
  row: number
  customerName: string
  invoiceNumber: string
  amount: number | null
  dueDate: string | null
  issueDate: string
  phone?: string
  email?: string
  gst?: string
  errors: string[]
}

export interface ParsedCustomer {
  name: string
  phone?: string
  email?: string
  gst?: string
}

export interface ParsedInvoice {
  customerName: string
  invoiceNumber: string
  amount: number
  outstandingAmount: number
  issueDate: Date
  dueDate: Date
  status: 'PENDING' | 'OVERDUE' | 'PARTIAL' | 'PAID' | 'DISPUTED'
}

export interface ParseError {
  row: number
  message: string
}

export interface ParsedData {
  rows: ImportPreviewRow[]
  customers: ParsedCustomer[]
  invoices: ParsedInvoice[]
  errors: ParseError[]
}

const columnAliases: Record<string, string[]> = {
  customerName: ['Customer Name', 'Customer'],
  invoiceNumber: ['Invoice Number', 'Invoice'],
  amount: ['Invoice Amount', 'Amount'],
  dueDate: ['Due Date'],
  issueDate: ['Issue Date'],
  outstandingAmount: ['Outstanding Amount'],
  phone: ['Phone', 'Phone Number'],
  email: ['Email', 'Email Address'],
  gst: ['GST', 'GST Number'],
}

function valueFor(row: Record<string, unknown>, field: keyof typeof columnAliases): unknown {
  const key = (columnAliases[field] ?? []).find((candidate) => Object.prototype.hasOwnProperty.call(row, candidate))
  return key ? row[key] : undefined
}

function parseDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value
  if (typeof value === 'string' && value.trim()) {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) return date
  }
  if (typeof value === 'number') {
    const date = new Date((value - 25569) * 86_400_000)
    if (!Number.isNaN(date.getTime())) return date
  }
  return null
}

function parseNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const number = Number(value.replace(/[,$₹\s]/g, ''))
    if (Number.isFinite(number)) return number
  }
  return null
}

function text(value: unknown): string {
  return value === undefined || value === null ? '' : String(value).trim()
}

function startOfToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

/** Parses a CSV/XLSX file without persisting anything. */
export function parseExcelFile(buffer: Buffer): ParsedData {
  let workbook: xlsx.WorkBook
  try {
    workbook = xlsx.read(buffer, { type: 'buffer', cellDates: true })
  } catch (error) {
    return { rows: [], customers: [], invoices: [], errors: [{ row: 0, message: `Could not read file: ${error instanceof Error ? error.message : 'unknown error'}` }] }
  }

  const sheetName = workbook.SheetNames[0]
  if (!sheetName) return { rows: [], customers: [], invoices: [], errors: [{ row: 0, message: 'No sheets found in file' }] }

  const sheet = workbook.Sheets[sheetName]
  if (!sheet) return { rows: [], customers: [], invoices: [], errors: [{ row: 0, message: 'Could not read the first sheet' }] }
  const sourceRows = xlsx.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })
  if (sourceRows.length === 0) return { rows: [], customers: [], invoices: [], errors: [{ row: 0, message: 'The first sheet has no invoice rows' }] }

  const customers = new Map<string, ParsedCustomer>()
  const invoices: ParsedInvoice[] = []
  const rows: ImportPreviewRow[] = []
  const errors: ParseError[] = []
  const today = startOfToday()

  sourceRows.forEach((source, index) => {
    const row = index + 2
    const customerName = text(valueFor(source, 'customerName'))
    const invoiceNumber = text(valueFor(source, 'invoiceNumber')) || `INV-${row}`
    const amount = parseNumber(valueFor(source, 'amount'))
    const dueDate = parseDate(valueFor(source, 'dueDate'))
    const issueDate = parseDate(valueFor(source, 'issueDate')) || today
    const rowErrors: string[] = []

    if (!customerName) rowErrors.push('Missing customer name')
    if (amount === null || amount < 0) rowErrors.push('Invalid amount')
    if (!dueDate) rowErrors.push('Due date missing or invalid')

    const previewRow: ImportPreviewRow = {
      row,
      customerName,
      invoiceNumber,
      amount,
      dueDate: dueDate?.toISOString() ?? null,
      issueDate: issueDate.toISOString(),
      phone: text(valueFor(source, 'phone')) || undefined,
      email: text(valueFor(source, 'email')) || undefined,
      gst: text(valueFor(source, 'gst')) || undefined,
      errors: rowErrors,
    }
    rows.push(previewRow)
    rowErrors.forEach((message) => errors.push({ row, message }))

    if (rowErrors.length || amount === null || !dueDate) return

    const customerKey = customerName.toLocaleLowerCase()
    if (!customers.has(customerKey)) {
      customers.set(customerKey, {
        name: customerName,
        phone: previewRow.phone,
        email: previewRow.email,
        gst: previewRow.gst,
      })
    }

    invoices.push({
      customerName,
      invoiceNumber,
      amount,
      outstandingAmount: amount,
      issueDate,
      dueDate,
      status: dueDate < today ? 'OVERDUE' : 'PENDING',
    })
  })

  return { rows, customers: [...customers.values()], invoices, errors }
}
