import { prisma } from '@autostate/database'
import { notFound } from 'next/navigation'
import crypto from 'crypto'
import { InvoiceList } from '@/components/customers/invoice-list'
import { CurrencyDisplay } from '@/components/shared/currency-display'
import { ShieldAlert, CreditCard } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PortalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

  const portalToken = await prisma.portalAccessToken.findUnique({
    where: { tokenHash },
    include: {
      customer: {
        include: {
          company: true,
          invoices: {
            where: {
              status: { in: ['PENDING', 'OVERDUE', 'PARTIAL'] }
            },
            orderBy: { dueDate: 'asc' }
          }
        }
      }
    }
  })

  if (!portalToken) {
    return <ExpiredLink />
  }

  if (new Date() > portalToken.expiresAt) {
    return <ExpiredLink />
  }

  const { customer } = portalToken
  const { invoices, company } = customer

  const totalOutstanding = invoices.reduce((acc, inv) => acc + Number(inv.outstandingAmount), 0)

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-4xl space-y-8">
        <header className="flex flex-col items-center text-center space-y-2">
          <div className="w-16 h-16 bg-surface-card border border-surface-border rounded-2xl flex items-center justify-center mb-2 shadow-xl shadow-black/20">
            <span className="text-2xl font-black bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
              {company.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <h1 className="text-3xl font-medium tracking-tight">{company.name}</h1>
          <p className="text-zinc-400">Payment Portal for {customer.name}</p>
        </header>

        {totalOutstanding > 0 ? (
          <div className="bg-surface-card border border-surface-border rounded-2xl p-8 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
            <span className="text-sm font-medium text-zinc-400 uppercase tracking-widest mb-4">Total Outstanding</span>
            <CurrencyDisplay value={totalOutstanding} className="text-6xl font-medium tracking-tighter" />
            
            <form action={`/api/portal/${token}/pay`} method="POST" className="mt-8">
              <button 
                type="submit"
                className="flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-black font-semibold hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/10"
              >
                <CreditCard className="w-5 h-5" />
                Pay Full Balance
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-surface-card border border-surface-border rounded-2xl p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-medium mb-2">All Caught Up!</h2>
            <p className="text-zinc-400">You have no outstanding invoices with {company.name}.</p>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-medium pl-1">Outstanding Invoices</h3>
          <InvoiceList invoices={invoices} />
        </div>
      </div>
    </div>
  )
}

function ExpiredLink() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-sm">
        <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-medium tracking-tight">Link Expired or Invalid</h1>
        <p className="text-zinc-400">
          This payment portal link is no longer valid. Please contact the company to request a new payment link.
        </p>
      </div>
    </div>
  )
}
