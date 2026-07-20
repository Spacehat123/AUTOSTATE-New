import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma, Prisma } from '@autostate/database'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  paidAmount: z.string().refine(val => !isNaN(Number(val)), {
    message: "paidAmount must be a numeric string"
  }),
  receivedAt: z.string().datetime().or(z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "receivedAt must be a valid date string"
  }))
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()

  try {
    const { id } = await params
    const body = await request.json()
    
    // Safely cast if the frontend accidentally sent a raw JS number instead of a string
    if (typeof body.paidAmount === 'number') {
      body.paidAmount = body.paidAmount.toString()
    }
    
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input data', details: parsed.error.format() }, 
        { status: 400 }
      )
    }
    
    const { paidAmount, receivedAt } = parsed.data
    
    const invoice = await prisma.invoice.findUnique({ where: { id }, include: { customer: true } })
    
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }
    
    if (invoice.customer.companyId !== user.companyId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    // Precision math logic using Decimal to avoid floating-point loss
    const paidDecimal = new Prisma.Decimal(paidAmount)
    const currentOutstanding = invoice.outstandingAmount // Automatically a Decimal instance
    
    let newStatus = invoice.status
    let newOutstanding = currentOutstanding
    const remaining = currentOutstanding.minus(paidDecimal)
    if (paidDecimal.lte(0) || paidDecimal.gt(currentOutstanding)) {
      return NextResponse.json({ error: 'Payment amount must be greater than zero and cannot exceed the outstanding balance' }, { status: 400 })
    }
    
    if (paidDecimal.gte(currentOutstanding)) {
      newStatus = 'PAID'
      newOutstanding = new Prisma.Decimal(0)
    } else {
      newStatus = 'PARTIAL'
      newOutstanding = remaining
    }
    
    const paymentTimestamp = new Date(receivedAt)
    const updatedInvoice = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: { companyId: user.companyId, amount: paidDecimal, receivedAt: paymentTimestamp }
      })
      await tx.paymentAllocation.create({
        data: { paymentId: payment.id, invoiceId: invoice.id, amount: paidDecimal }
      })
      return tx.invoice.update({
        where: { id },
        data: {
          status: newStatus,
          outstandingAmount: newOutstanding,
          paidAt: newStatus === 'PAID' ? paymentTimestamp : null,
          closedAt: newStatus === 'PAID' ? paymentTimestamp : null,
        }
      })
    })
    
    return NextResponse.json(updatedInvoice)
  } catch (error) {
    console.error('[INVOICE_MARK_PAID]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
