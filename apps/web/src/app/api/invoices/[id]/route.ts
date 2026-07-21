import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth'
import { logAction } from '@autostate/database'
import { requireRole, InsufficientRoleError, roleErrorResponse } from '@/lib/rbac'

export const dynamic = 'force-dynamic'

/**
 * Only allow mutation of fields that do NOT touch the payment domain.
 * outstandingAmount and status are owned by the payment allocation transaction
 * (POST /api/payments) and must not be written directly.
 */
const bodySchema = z.object({
  dueDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'dueDate must be a valid date string' })
    .optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser()

  try {
    requireRole(user, 'ADMIN')
  } catch (error) {
    if (error instanceof InsufficientRoleError) {
      return roleErrorResponse()
    }
    throw error
  }

  try {
    const { id } = await params
    const body = await request.json()

    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.format() },
        { status: 400 },
      )
    }

    const { dueDate } = parsed.data

    const invoice = await user.db.invoice.findUnique({
      where: { id },
      include: { customer: true },
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    if (!dueDate) {
      return NextResponse.json(invoice)
    }

    const updatedInvoice = await user.db.invoice.update({
      where: { id },
      data: { dueDate: new Date(dueDate) },
    })

    logAction(user.companyId, user.id, 'invoice.update', 'invoice', updatedInvoice.id, {
      dueDate
    })

    return NextResponse.json(updatedInvoice)
  } catch (error) {
    console.error('[INVOICE_PATCH]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
