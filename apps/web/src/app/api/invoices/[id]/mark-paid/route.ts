import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma, Prisma } from '@autostate/database'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  paidAmount: z.string().refine(val => !isNaN(Number(val)), {
    message: "paidAmount must be a numeric string"
  }),
  paidDate: z.string().datetime().or(z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "paidDate must be a valid date string"
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
    
    const { paidAmount, paidDate } = parsed.data
    
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { customer: true }
    })
    
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
    let newPaidDate = invoice.paidDate
    
    const remaining = currentOutstanding.minus(paidDecimal)
    
    if (paidDecimal.gte(currentOutstanding)) {
      newStatus = 'PAID'
      newOutstanding = new Prisma.Decimal(0)
      newPaidDate = new Date(paidDate)
    } else {
      newStatus = 'PARTIAL'
      newOutstanding = remaining
    }
    
    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        status: newStatus,
        outstandingAmount: newOutstanding,
        paidDate: newStatus === 'PAID' ? newPaidDate : invoice.paidDate,
      }
    })
    
    return NextResponse.json(updatedInvoice)
  } catch (error) {
    console.error('[INVOICE_MARK_PAID]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
