import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma, Prisma } from '@autostate/database'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  dueDate: z.string().datetime().or(z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "dueDate must be a valid date string"
  })).optional(),
  outstandingAmount: z.union([z.string(), z.number()]).refine(val => !isNaN(Number(val)), {
    message: "outstandingAmount must be numeric"
  }).optional(),
  status: z.enum(['PENDING', 'OVERDUE', 'PARTIAL', 'PAID', 'DISPUTED']).optional()
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()

  try {
    const { id } = await params
    const body = await request.json()
    
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.format() }, 
        { status: 400 }
      )
    }
    
    const { dueDate, outstandingAmount, status } = parsed.data
    
    // 1. Fetch invoice and include customer to check company ownership
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { customer: true }
    })
    
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }
    
    // 2. Multi-tenant security barrier
    if (invoice.customer.companyId !== user.companyId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    // 3. Prepare partial update payload
    const updateData: any = {}
    if (dueDate) {
      updateData.dueDate = new Date(dueDate)
    }
    if (outstandingAmount !== undefined) {
      updateData.outstandingAmount = new Prisma.Decimal(outstandingAmount.toString())
    }
    if (status) {
      updateData.status = status
    }
    
    // If nothing to update, just return the existing record
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(invoice)
    }
    
    // 4. Update the record
    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: updateData
    })
    
    return NextResponse.json(updatedInvoice)
  } catch (error) {
    console.error('[INVOICE_PATCH]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
