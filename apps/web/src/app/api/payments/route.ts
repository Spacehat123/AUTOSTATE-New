import { NextRequest, NextResponse } from 'next/server'
import { Prisma, prisma } from '@autostate/database'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const allocationSchema = z.object({
  invoiceId: z.string().min(1),
  amount: z.union([z.string(), z.number()]),
})

const paymentSchema = z.object({
  amount: z.union([z.string(), z.number()]),
  receivedAt: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), 'receivedAt must be a valid date'),
  reference: z.string().max(200).optional(),
  method: z.string().max(100).optional(),
  notes: z.string().max(5_000).optional(),
  allocations: z.array(allocationSchema).min(1, 'At least one allocation is required'),
})

/**
 * GET /api/payments
 * Returns all payments for the authenticated company, newest first,
 * each with their allocations and the related invoice snapshot.
 */
export async function GET() {
  const user = await getCurrentUser()
  try {
    const payments = await prisma.payment.findMany({
      where: { companyId: user.companyId },
      orderBy: { receivedAt: 'desc' },
      include: {
        allocations: {
          include: {
            invoice: {
              select: {
                id: true,
                invoiceNumber: true,
                amount: true,
                outstandingAmount: true,
                status: true,
                customer: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    })
    return NextResponse.json(payments)
  } catch (error) {
    console.error('[PAYMENTS_GET]', error)
    return NextResponse.json({ error: 'Unable to load payments' }, { status: 500 })
  }
}

/**
 * POST /api/payments
 * Records one received payment and one or more invoice allocations atomically.
 *
 * Invariants enforced:
 *  - payment.amount === sum(allocations[].amount)  (no over/under-allocation)
 *  - Each allocation.amount > 0
 *  - Each allocation.amount <= invoice.outstandingAmount  (no over-payment)
 *  - Each invoiceId appears at most once in the allocation list
 *  - All invoices belong to the authenticated company (tenant isolation)
 *  - Invoice status and outstandingAmount are updated inside the same transaction
 *  - paidAt / closedAt are stamped only when outstandingAmount reaches zero
 */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser()

  const parsed = paymentSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payment data', details: parsed.error.format() },
      { status: 400 },
    )
  }

  const input = parsed.data
  const paymentAmount = new Prisma.Decimal(input.amount.toString())
  const allocations = input.allocations.map((a) => ({
    invoiceId: a.invoiceId,
    amount: new Prisma.Decimal(a.amount.toString()),
  }))

  // --- Pre-transaction validation ---

  if (paymentAmount.lte(0)) {
    return NextResponse.json({ error: 'Payment amount must be positive' }, { status: 400 })
  }

  if (allocations.some((a) => a.amount.lte(0))) {
    return NextResponse.json({ error: 'Every allocation amount must be positive' }, { status: 400 })
  }

  const allocatedTotal = allocations.reduce(
    (sum, a) => sum.plus(a.amount),
    new Prisma.Decimal(0),
  )
  if (!allocatedTotal.equals(paymentAmount)) {
    return NextResponse.json(
      { error: 'Allocated total must equal the payment amount' },
      { status: 400 },
    )
  }

  const uniqueInvoiceIds = new Set(allocations.map((a) => a.invoiceId))
  if (uniqueInvoiceIds.size !== allocations.length) {
    return NextResponse.json(
      { error: 'Each invoice may appear at most once in an allocation' },
      { status: 400 },
    )
  }

  try {
    const payment = await prisma.$transaction(async (tx) => {
      // 1. Load and authorise invoices inside the transaction for a consistent read
      const invoices = await tx.invoice.findMany({
        where: {
          id: { in: [...uniqueInvoiceIds] },
          customer: { companyId: user.companyId },
        },
      })

      if (invoices.length !== uniqueInvoiceIds.size) {
        throw new Error('One or more invoices were not found or do not belong to your company')
      }

      const invoicesById = new Map(invoices.map((inv) => [inv.id, inv]))

      // 2. Verify no allocation exceeds the current outstanding balance
      for (const alloc of allocations) {
        const inv = invoicesById.get(alloc.invoiceId)!
        if (alloc.amount.gt(inv.outstandingAmount)) {
          throw new Error(
            `Allocation of ${alloc.amount} exceeds outstanding balance ${inv.outstandingAmount} on invoice ${inv.invoiceNumber}`,
          )
        }
      }

      // 3. Create the Payment record
      const createdPayment = await tx.payment.create({
        data: {
          companyId: user.companyId,
          amount: paymentAmount,
          receivedAt: new Date(input.receivedAt),
          reference: input.reference,
          method: input.method,
          notes: input.notes,
        },
      })

      // 4. Create allocations and update each invoice atomically
      for (const alloc of allocations) {
        const inv = invoicesById.get(alloc.invoiceId)!
        const newOutstanding = inv.outstandingAmount.minus(alloc.amount)
        const fullySettled = newOutstanding.isZero()

        await tx.paymentAllocation.create({
          data: { paymentId: createdPayment.id, invoiceId: inv.id, amount: alloc.amount },
        })

        await tx.invoice.update({
          where: { id: inv.id },
          data: {
            outstandingAmount: newOutstanding,
            status: fullySettled ? 'PAID' : 'PARTIAL',
            // Timestamps belong to the Payment; only stamp invoice when fully settled
            paidAt: fullySettled ? new Date(input.receivedAt) : null,
            closedAt: fullySettled ? new Date(input.receivedAt) : null,
          },
        })
      }

      return createdPayment
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error('[PAYMENTS_POST]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to record payment' },
      { status: 400 },
    )
  }
}
