import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST as importApi } from '@/app/api/import/route'
import { processImport } from '@/inngest/functions/process-import'
import { prisma } from '@autostate/database'
import crypto from 'crypto'
import { parsePaymentFile } from '@autostate/importer'

vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn().mockResolvedValue({
    id: 'user_123',
    companyId: 'company_1',
    role: 'OWNER'
  }),
}))

vi.mock('@autostate/database', () => {
  const prismaMock = {
    importJob: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    invoice: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    payment: {
      create: vi.fn(),
    },
    paymentAllocation: {
      create: vi.fn(),
    },
    customer: {
      update: vi.fn(),
    },
    $transaction: vi.fn(async (cb) => {
      return cb(prismaMock)
    }),
  }
  return { prisma: prismaMock }
})

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockReturnValue({
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: { path: 'fake' }, error: null }),
        download: vi.fn().mockResolvedValue({ data: new Blob(['fake content']), error: null }),
      }),
    },
  }),
}))

vi.mock('@/lib/inngest', () => ({
  inngest: {
    send: vi.fn(),
  },
}))

vi.mock('@/inngest/client', () => ({
  inngest: {
    createFunction: vi.fn((config, handler) => handler),
  },
}))

vi.mock('@autostate/importer', () => ({
  parsePaymentFile: vi.fn(),
}))

describe('Payment Importer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('Duplicate upload returns 409', async () => {
    // Mock prisma to return an existing done job with the same file hash
    vi.mocked(prisma.importJob.findFirst).mockResolvedValueOnce({
      id: 'job_1',
      companyId: 'company_1',
      fileHash: 'fake_hash',
      status: 'DONE',
    } as any)

    const req = {
      headers: new Headers({ 'content-type': 'multipart/form-data' }),
      formData: vi.fn().mockResolvedValue({
        get: (key: string) => {
          if (key === 'file') {
            const blob = new Blob(['Invoice,Amount,Date\nINV-1,100,2023-01-01'], { type: 'text/csv' })
            const file = new File([blob], 'payments.csv', { type: 'text/csv' })
            return file
          }
          if (key === 'type') return 'PAYMENT'
          return null
        }
      })
    } as unknown as NextRequest

    const res = await importApi(req)
    expect(res.status).toBe(409)
    const json = await res.json()
    expect(json.error).toBe('File has already been imported')
  })

  it('Unknown invoice number records error', async () => {
    const handler = processImport as unknown as (args: any) => Promise<any>
    
    // Mock parsePaymentFile to return a payment with an unknown invoice
    vi.mocked(parsePaymentFile).mockReturnValueOnce({
      payments: [
        { invoiceNumber: 'INV-UNKNOWN', amount: 100, date: new Date() }
      ],
      errors: []
    } as any)

    // Mock prisma.invoice.findFirst to return null (not found)
    vi.mocked(prisma.invoice.findFirst).mockResolvedValueOnce(null)

    const mockStep = { run: vi.fn(async (name, cb) => await cb()) }
    await handler({
      event: { data: { jobId: 'job_1', filePath: 'fake.csv', companyId: 'company_1', type: 'PAYMENT' } },
      step: mockStep
    })

    // Expect the job to be marked as DONE with the skipped error
    expect(prisma.importJob.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'job_1' },
        data: expect.objectContaining({
          status: 'DONE',
          processedRows: 0,
          errorLog: expect.stringContaining('Unknown invoice number INV-UNKNOWN')
        })
      })
    )
  })

  it('Overpayment logic updates customer credit balance', async () => {
    const handler = processImport as unknown as (args: any) => Promise<any>
    
    const paymentDate = new Date()
    vi.mocked(parsePaymentFile).mockReturnValueOnce({
      payments: [
        { invoiceNumber: 'INV-500', amount: 700, date: paymentDate }
      ],
      errors: []
    } as any)

    // Mock an invoice with outstandingAmount of 500
    vi.mocked(prisma.invoice.findFirst).mockResolvedValueOnce({
      id: 'inv_1',
      invoiceNumber: 'INV-500',
      outstandingAmount: 500, // 500 expected
      customerId: 'cust_1',
    } as any)

    // Mock payment creation
    vi.mocked(prisma.payment.create).mockResolvedValueOnce({ id: 'pay_1' } as any)

    const mockStep = { run: vi.fn(async (name, cb) => await cb()) }
    await handler({
      event: { data: { jobId: 'job_1', filePath: 'fake.csv', companyId: 'company_1', type: 'PAYMENT' } },
      step: mockStep
    })

    // Ensure payment is created for the full 700 amount
    expect(prisma.payment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          amount: 700,
        })
      })
    )

    // Ensure allocation is only for 500
    expect(prisma.paymentAllocation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          paymentId: 'pay_1',
          invoiceId: 'inv_1',
          amount: 500
        }
      })
    )

    // Ensure invoice outstanding is set to 0
    expect(prisma.invoice.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'inv_1' },
        data: {
          outstandingAmount: 0,
          status: 'PAID'
        }
      })
    )

    // Ensure customer gets 200 credit
    expect(prisma.customer.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'cust_1' },
        data: {
          creditBalance: { increment: 200 }
        }
      })
    )
  })

  it('Duplicate row is skipped', async () => {
    const handler = processImport as unknown as (args: any) => Promise<any>
    
    const paymentDate = new Date()
    vi.mocked(parsePaymentFile).mockReturnValueOnce({
      payments: [
        { invoiceNumber: 'INV-DUP', amount: 100, date: paymentDate, reference: 'DUP-REF' }
      ],
      errors: []
    } as any)

    vi.mocked(prisma.invoice.findFirst).mockResolvedValueOnce({
      id: 'inv_1',
      invoiceNumber: 'INV-DUP',
      outstandingAmount: 100,
      customerId: 'cust_1',
    } as any)

    // Simulate Prisma throwing a unique constraint violation on idempotencyKey
    vi.mocked(prisma.payment.create).mockRejectedValueOnce(
      Object.assign(new Error('Unique constraint failed'), { code: 'P2002', clientVersion: '5.x' })
    )

    const mockStep = { run: vi.fn(async (name, cb) => await cb()) }
    
    await handler({
      event: { data: { jobId: 'job_1', filePath: 'fake.csv', companyId: 'company_1', type: 'PAYMENT' } },
      step: mockStep
    })

    // Expect the job to be marked as DONE with the skipped error
    expect(prisma.importJob.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'job_1' },
        data: expect.objectContaining({
          status: 'DONE',
          errorLog: expect.stringContaining('Skipped: Duplicate payment reference DUP-REF')
        })
      })
    )
  })
})
