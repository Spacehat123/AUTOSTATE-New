import { getCurrentUser } from '@/lib/auth'
import { PageHeader } from '@/components/shared/page-header'
import { getInvoicesByCompany, getPaymentsByCompany } from '@/lib/services/payments'
import { InvoicesPaymentsView } from '@/components/invoices/invoices-payments-view'

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const user = await getCurrentUser()
  const { tab } = await searchParams

  const [invoices, payments] = await Promise.all([
    getInvoicesByCompany(user.companyId),
    getPaymentsByCompany(user.companyId),
  ])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Invoices & Payments"
        subtitle="Track all outstanding invoices and review collected payments across every customer."
      />
      <InvoicesPaymentsView
        invoices={invoices as any}
        payments={payments as any}
        defaultTab={tab === 'payments' ? 'payments' : 'invoices'}
      />
    </div>
  )
}
