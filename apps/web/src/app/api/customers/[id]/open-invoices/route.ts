import { NextResponse } from 'next/server'
// db is now fetched from user
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/customers/[id]/open-invoices
 * Returns all PENDING, OVERDUE, and PARTIAL invoices for a customer.
 * Used by the Record Payment dialog to populate the allocation selector.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser()
  const { id: customerId } = await params

  const invoices = await user.db.invoice.findMany({
    where: {
      customerId,
      status: { in: ['PENDING', 'OVERDUE', 'PARTIAL'] },
    },
    orderBy: { dueDate: 'asc' },
    select: {
      id: true,
      invoiceNumber: true,
      amount: true,
      outstandingAmount: true,
      status: true,
      dueDate: true,
    },
  })

  return NextResponse.json(invoices)
}
