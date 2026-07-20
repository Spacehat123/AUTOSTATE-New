import { NextResponse } from 'next/server'
import { prisma } from '@autostate/database'
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

  // Verify the customer belongs to this company
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { companyId: true },
  })

  if (!customer) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
  }
  if (customer.companyId !== user.companyId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const invoices = await prisma.invoice.findMany({
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
