import * as xlsx from 'xlsx'

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
  status: string
}

export interface ParseError {
  row: number
  message: string
}

export interface ParsedData {
  customers: ParsedCustomer[]
  invoices: ParsedInvoice[]
  errors: ParseError[]
}

function parseDate(val: any): Date | null {
  if (val instanceof Date) return val
  if (typeof val === 'string') {
    const d = new Date(val)
    if (!isNaN(d.getTime())) return d
  }
  if (typeof val === 'number') {
    // Excel date serial
    // xlsx cellDates usually converts these automatically, but as a fallback:
    // Excel dates start from 1900-01-01 (1). 25569 is 1970-01-01.
    const d = new Date((val - 25569) * 86400 * 1000)
    if (!isNaN(d.getTime())) return d
  }
  return null
}

function parseNumber(val: any): number | null {
  if (typeof val === 'number') return val
  if (typeof val === 'string') {
    const n = parseFloat(val.replace(/,/g, '').trim())
    if (!isNaN(n)) return n
  }
  return null
}

export function parseExcelFile(buffer: Buffer): ParsedData {
  const customersMap = new Map<string, ParsedCustomer>()
  const invoices: ParsedInvoice[] = []
  const errors: ParseError[] = []

  let workbook: xlsx.WorkBook
  try {
    workbook = xlsx.read(buffer, { type: 'buffer', cellDates: true })
  } catch (e: any) {
    return { customers: [], invoices: [], errors: [{ row: 0, message: `Failed to read file: ${e.message}` }] }
  }

  const sheetName = workbook.SheetNames[0]
  if (!sheetName) {
    return { customers: [], invoices: [], errors: [{ row: 0, message: 'No sheets found in file' }] }
  }

  const sheet = workbook.Sheets[sheetName]
  const rows = xlsx.utils.sheet_to_json<any>(sheet!)

  rows.forEach((row, index) => {
    const rowNum = index + 2 // 1-based, plus header row

    const customerName = String(row['Customer Name'] || '').trim()
    if (!customerName || customerName === 'undefined') {
      errors.push({ row: rowNum, message: 'Missing Customer Name' })
      return // skip this row for further parsing
    }

    const amount = parseNumber(row['Invoice Amount'])
    if (amount === null) {
      errors.push({ row: rowNum, message: 'Invalid or missing Invoice Amount' })
    }

    const issueDate = parseDate(row['Issue Date'])
    if (!issueDate) {
      errors.push({ row: rowNum, message: 'Invalid or missing Issue Date' })
    }

    const dueDate = parseDate(row['Due Date'])
    if (!dueDate) {
      errors.push({ row: rowNum, message: 'Invalid or missing Due Date' })
    }

    if (!customersMap.has(customerName)) {
      customersMap.set(customerName, {
        name: customerName,
        phone: row['Phone'] ? String(row['Phone']).trim() : undefined,
        email: row['Email'] ? String(row['Email']).trim() : undefined,
        gst: row['GST'] ? String(row['GST']).trim() : undefined,
      })
    }

    if (amount !== null && issueDate && dueDate) {
      const invoiceNumber = String(row['Invoice Number'] || `INV-${rowNum}`).trim()
      let outstandingAmount = parseNumber(row['Outstanding Amount'])
      if (outstandingAmount === null) {
        outstandingAmount = amount // fallback
      }
      
      let status = 'PENDING'
      if (row['Status']) {
        const statusRaw = String(row['Status']).trim().toUpperCase()
        const validStatuses = ['DRAFT', 'PENDING', 'OVERDUE', 'PARTIAL', 'PAID', 'VOID', 'UNCOLLECTIBLE']
        if (validStatuses.includes(statusRaw)) {
          status = statusRaw
        }
      }

      invoices.push({
        customerName,
        invoiceNumber,
        amount,
        outstandingAmount,
        issueDate,
        dueDate,
        status,
      })
    }
  })

  return {
    customers: Array.from(customersMap.values()),
    invoices,
    errors
  }
}
