import { NextRequest, NextResponse } from 'next/server'
import { Prisma, prisma } from '@autostate/database'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const paymentSchema = z.object({
  amount: z.union([z.string(), z.number()]),
  receivedAt: z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'receivedAt must be a valid date'),
  reference: z.string().max(200).optional(),
  method: z.string().max(100).optional(),
  notes: z.string().max(5_000).optional(),
  allocations: z.array(z.object({ invoiceId: z.string().min(1), amount: z.union([z.string(), z.number()]) })).min(1),
})

/** Records one received payment and any number of invoice allocations atomically. */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  const parsed = paymentSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payment', details: parsed.error.format() }, { status: 400 })

  try {
    const input = parsed.data
    const paymentAmount = new Prisma.Decimal(input.amount.toString())
    const allocations = input.allocations.map((allocation) => ({ ...allocation, amount: new Prisma.Decimal(allocation.amount.toString()) }))
    const allocatedTotal = allocations.reduce((total, allocation) => total.plus(allocation.amount), new Prisma.Decimal(0))
    if (paymentAmount.lte(0) || allocations.some((allocation) => allocation.amount.lte(0)) || !allocatedTotal.equals(paymentAmount)) {
      return NextResponse.json({ error: 'Payment amount must equal the positive total of its allocations' }, { status: 400 })
    }
    if (new Set(allocations.map((allocation) => allocation.invoiceId)).size !== allocations.length) {
      return NextResponse.json({ error: 'An invoice can appear only once in a payment allocation' }, { status: 400 })
    }

    const payment = await prisma.$transaction(async (tx) => {
      const invoices = await tx.invoice.findMany({ where: { id: { in: allocations.map((allocation) => allocation.invoiceId) }, customer: { companyId: user.companyId } } })
      if (invoices.length !== allocations.length) throw new Error('One or more invoices were not found')
      const invoicesById = new Map(invoices.map((invoice) => [invoice.id, invoice]))
      for (const allocation of allocations) {
        const invoice = invoicesById.get(allocation.invoiceId)
        if (!invoice || allocation.amount.gt(invoice.outstandingAmount)) throw new Error('An allocation exceeds its invoice balance')
      }

      const createdPayment = await tx.payment.create({
        data: { companyId: user.companyId, amount: paymentAmount, receivedAt: new Date(input.receivedAt), reference: input.reference, method: input.method, notes: input.notes },
      })
      for (const allocation of allocations) {
        const invoice = invoicesById.get(allocation.invoiceId)!
        const outstandingAmount = invoice.outstandingAmount.minus(allocation.amount)
        const settled = outstandingAmount.isZero()
        await tx.paymentAllocation.create({ data: { paymentId: createdPayment.id, invoiceId: invoice.id, amount: allocation.amount } })
        await tx.invoice.update({
          where: { id: invoice.id },
          data: { outstandingAmount, status: settled ? 'PAID' : 'PARTIAL', paidAt: settled ? new Date(input.receivedAt) : null, closedAt: settled ? new Date(input.receivedAt) : null },
        })
      }
      return createdPayment
    })
    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to record payment' }, { status: 400 })
  }
}
