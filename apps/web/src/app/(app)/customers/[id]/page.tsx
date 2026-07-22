import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { getCustomerById } from '@/lib/services/customers'
import { getOpenInvoicesForCustomer } from '@/lib/services/payments'
import { CurrencyDisplay } from '@/components/shared/currency-display'
import { RiskBadge } from '@/components/shared/risk-badge'
import { 
  AiSummary
} from '@/components/customers/profile-components'
import { InvoiceList } from '@/components/customers/invoice-list'
import { CommunicationTimeline } from '@/components/customers/communication-timeline'
import { CustomerActions } from '@/components/customers/customer-actions'

import { CustomerLanguage } from '@/components/customers/customer-language'

export default async function CustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  const { id } = await params
  
  const [result, openInvoices] = await Promise.all([
    getCustomerById(id, user.db),
    getOpenInvoicesForCustomer(id),
  ])
  
  if (result.error === 'Customer not found' || result.status === 404) {
    notFound()
  }
  if (result.error) {
    throw new Error(result.error)
  }

  const customer = result.data!
  
  // Compute total outstanding across all non-paid, non-disputed invoices
  const totalOutstanding = customer.invoices
    .filter((inv: any) => ['PENDING', 'OVERDUE', 'PARTIAL'].includes(inv.status))
    .reduce((sum: number, inv: any) => sum + Number(inv.outstandingAmount), 0)

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-12">
      {/* Back navigation */}
      <div>
        <Link 
          href="/customers" 
          className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Customers
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">{customer.name}</h1>
            <RiskBadge score={customer.riskScore} />
          </div>
          <div className="flex items-center gap-3 text-zinc-400">
            <div className="flex items-center gap-2">
              <span>Total Outstanding:</span>
              <span className="text-xl font-bold text-rose-500">
                <CurrencyDisplay value={totalOutstanding} />
              </span>
            </div>
            <span className="text-surface-border">|</span>
            <CustomerLanguage customerId={customer.id} initialLanguage={customer.preferredLanguage as string | null} />
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        {/* Left Column (Wider for table if we wanted, but sticking to 50/50 per spec) */}
        <div className="flex flex-col gap-6">
          <AiSummary summary={customer.aiSummary} />
          <InvoiceList invoices={customer.invoices} />
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          <CustomerActions customerId={customer.id} openInvoices={openInvoices as any} />
          <CommunicationTimeline messages={customer.messages} />
        </div>
      </div>
    </div>
  )
}
