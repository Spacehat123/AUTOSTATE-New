import { prisma } from '@autostate/database'

/**
 * Fetches all open (non-PAID, non-DISPUTED) invoices for a customer,
 * ordered by due date ascending so oldest debts are allocated first by default.
 * Used to populate the allocation selector in the Record Payment dialog.
 */
export async function getOpenInvoicesForCustomer(customerId: string, companyId: string) {
  return prisma.invoice.findMany({
    where: {
      customerId,
      customer: { companyId },
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
}

/**
 * Returns all Payment records for a given company, newest first,
 * each hydrated with its allocations and a snapshot of the related invoice + customer.
 */
export async function getPaymentsByCompany(companyId: string) {
  return prisma.payment.findMany({
    where: { companyId },
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
}

/**
 * Returns all invoices for a company across all customers, newest due-date first.
 * Used by the /invoices page.
 */
export async function getInvoicesByCompany(companyId: string) {
  return prisma.invoice.findMany({
    where: { customer: { companyId } },
    orderBy: { dueDate: 'asc' },
    include: {
      customer: { select: { id: true, name: true } },
    },
  })
}
