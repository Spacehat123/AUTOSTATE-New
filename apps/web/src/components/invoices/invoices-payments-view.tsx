'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { format, differenceInDays } from 'date-fns'
import { FileText, CreditCard, Search, ChevronUp, ChevronDown } from 'lucide-react'
import { CurrencyDisplay } from '@/components/shared/currency-display'
import { EmptyState } from '@/components/shared/empty-state'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Invoice {
  id: string
  invoiceNumber: string
  amount: unknown
  outstandingAmount: unknown
  status: string
  dueDate: string | Date
  customer: { id: string; name: string }
}

interface PaymentAllocation {
  id: string
  amount: unknown
  invoice: {
    id: string
    invoiceNumber: string
    customer: { id: string; name: string }
  }
}

interface Payment {
  id: string
  amount: unknown
  receivedAt: string | Date
  reference?: string | null
  method?: string | null
  allocations: PaymentAllocation[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusColors(status: string) {
  switch (status) {
    case 'PENDING':  return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
    case 'OVERDUE':  return 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    case 'PARTIAL':  return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    case 'PAID':     return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    case 'DISPUTED': return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
    default:         return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
  }
}

function methodLabel(method?: string | null) {
  const map: Record<string, string> = {
    BANK_TRANSFER: 'Bank Transfer',
    UPI: 'UPI',
    CHEQUE: 'Cheque',
    CASH: 'Cash',
    OTHER: 'Other',
  }
  return method ? (map[method] ?? method) : '—'
}

// ─── Invoice Table ────────────────────────────────────────────────────────────

function InvoiceTable({ invoices }: { invoices: Invoice[] }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sortField, setSortField] = useState<'dueDate' | 'amount' | 'outstandingAmount'>('dueDate')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const filtered = useMemo(() => {
    let list = invoices.filter((inv) => {
      const matchSearch =
        search === '' ||
        inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        inv.customer.name.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'ALL' || inv.status === statusFilter
      return matchSearch && matchStatus
    })
    list = [...list].sort((a, b) => {
      let av: number, bv: number
      if (sortField === 'dueDate') {
        av = new Date(a.dueDate).getTime()
        bv = new Date(b.dueDate).getTime()
      } else {
        av = Number(a[sortField])
        bv = Number(b[sortField])
      }
      return sortDir === 'asc' ? av - bv : bv - av
    })
    return list
  }, [invoices, search, statusFilter, sortField, sortDir])

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortField(field); setSortDir('asc') }
  }

  const SortIcon = ({ field }: { field: typeof sortField }) =>
    sortField === field ? (
      sortDir === 'asc' ? <ChevronUp className="w-3 h-3 ml-1 inline" /> : <ChevronDown className="w-3 h-3 ml-1 inline" />
    ) : null

  if (invoices.length === 0) {
    return (
      <EmptyState
        icon={<FileText />}
        title="No Invoices"
        description="Import invoices from Settings → Import to get started."
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice or customer…"
            className="w-full pl-9 pr-4 py-2 text-sm bg-surface-card border border-surface-border rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-brand-500/50"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['ALL', 'PENDING', 'OVERDUE', 'PARTIAL', 'PAID', 'DISPUTED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                statusFilter === s
                  ? 'bg-brand-500 border-brand-500 text-white'
                  : 'border-surface-border text-zinc-400 hover:text-white hover:border-zinc-600'
              }`}
            >
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: invoices.length, suffix: 'invoices' },
          { label: 'Overdue', value: invoices.filter(i => i.status === 'OVERDUE').length, suffix: 'invoices', red: true },
          {
            label: 'Outstanding',
            value: <CurrencyDisplay value={invoices.filter(i => i.status !== 'PAID').reduce((s, i) => s + Number(i.outstandingAmount), 0)} compact />,
            suffix: '',
            red: true,
          },
          {
            label: 'Collected',
            value: <CurrencyDisplay value={invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + Number(i.amount), 0)} compact />,
            suffix: '',
            green: true,
          },
        ].map((stat, i) => (
          <div key={i} className="bg-surface-card border border-surface-border rounded-xl p-3">
            <div className="text-xs text-zinc-500 mb-1">{stat.label}</div>
            <div className={`text-lg font-bold ${stat.red ? 'text-rose-400' : stat.green ? 'text-emerald-400' : 'text-white'}`}>
              {stat.value}{stat.suffix && <span className="text-xs font-normal text-zinc-500 ml-1">{stat.suffix}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-surface-border bg-surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-surface-border/20">
                <th className="text-left font-semibold text-zinc-400 px-4 py-3">Customer</th>
                <th className="text-left font-semibold text-zinc-400 px-4 py-3">Invoice #</th>
                <th
                  className="text-left font-semibold text-zinc-400 px-4 py-3 cursor-pointer hover:text-white select-none"
                  onClick={() => toggleSort('amount')}
                >
                  Amount <SortIcon field="amount" />
                </th>
                <th
                  className="text-left font-semibold text-zinc-400 px-4 py-3 cursor-pointer hover:text-white select-none"
                  onClick={() => toggleSort('outstandingAmount')}
                >
                  Outstanding <SortIcon field="outstandingAmount" />
                </th>
                <th
                  className="text-left font-semibold text-zinc-400 px-4 py-3 cursor-pointer hover:text-white select-none"
                  onClick={() => toggleSort('dueDate')}
                >
                  Due <SortIcon field="dueDate" />
                </th>
                <th className="text-left font-semibold text-zinc-400 px-4 py-3">Overdue</th>
                <th className="text-right font-semibold text-zinc-400 px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-zinc-500 text-sm">
                    No invoices match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => {
                  const due = new Date(inv.dueDate)
                  const diffDays = differenceInDays(today, due)
                  return (
                    <tr key={inv.id} className="border-b border-surface-border/50 hover:bg-white/5 transition-colors last:border-0">
                      <td className="px-4 py-3">
                        <Link href={`/customers/${inv.customer.id}`} className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                          {inv.customer.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-mono text-white font-medium">{inv.invoiceNumber}</td>
                      <td className="px-4 py-3 text-white font-medium">
                        <CurrencyDisplay value={inv.amount} compact />
                      </td>
                      <td className="px-4 py-3">
                        {Number(inv.outstandingAmount) > 0 ? (
                          <span className="text-rose-400 font-medium">
                            <CurrencyDisplay value={inv.outstandingAmount} compact />
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-medium">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-zinc-400">{format(due, 'MMM d, yyyy')}</td>
                      <td className="px-4 py-3">
                        {inv.status === 'PAID' ? (
                          <span className="text-zinc-600">—</span>
                        ) : diffDays > 0 ? (
                          <span className="text-rose-400 font-medium">{diffDays}d overdue</span>
                        ) : diffDays === 0 ? (
                          <span className="text-amber-400 font-medium">Today</span>
                        ) : (
                          <span className="text-emerald-400">In {Math.abs(diffDays)}d</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${statusColors(inv.status)}`}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Payment History Table ────────────────────────────────────────────────────

function PaymentTable({ payments }: { payments: Payment[] }) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search) return payments
    const q = search.toLowerCase()
    return payments.filter((p) =>
      p.reference?.toLowerCase().includes(q) ||
      p.allocations.some(
        (a) =>
          a.invoice.invoiceNumber.toLowerCase().includes(q) ||
          a.invoice.customer.name.toLowerCase().includes(q),
      ),
    )
  }, [payments, search])

  if (payments.length === 0) {
    return (
      <EmptyState
        icon={<CreditCard />}
        title="No Payments Recorded"
        description="Open a customer profile and use the Payment quick-action to record a received payment."
      />
    )
  }

  const totalCollected = payments.reduce((s, p) => s + Number(p.amount), 0)

  return (
    <div className="space-y-4">
      {/* Search + summary */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer, invoice, reference…"
            className="w-full pl-9 pr-4 py-2 text-sm bg-surface-card border border-surface-border rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-brand-500/50"
          />
        </div>
        <div className="flex gap-3">
          <div className="bg-surface-card border border-surface-border rounded-xl px-4 py-2 text-sm">
            <span className="text-zinc-500">{payments.length} payments · </span>
            <span className="text-emerald-400 font-bold">
              <CurrencyDisplay value={totalCollected} compact />
            </span>
            <span className="text-zinc-500"> collected</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-surface-border bg-surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-surface-border/20">
                <th className="text-left font-semibold text-zinc-400 px-4 py-3">Date</th>
                <th className="text-left font-semibold text-zinc-400 px-4 py-3">Amount</th>
                <th className="text-left font-semibold text-zinc-400 px-4 py-3">Method</th>
                <th className="text-left font-semibold text-zinc-400 px-4 py-3">Reference</th>
                <th className="text-left font-semibold text-zinc-400 px-4 py-3">Allocated to</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-zinc-500 text-sm">
                    No payments match the search.
                  </td>
                </tr>
              ) : (
                filtered.map((payment) => (
                  <tr key={payment.id} className="border-b border-surface-border/50 hover:bg-white/5 transition-colors last:border-0 align-top">
                    <td className="px-4 py-3 text-zinc-300 whitespace-nowrap">
                      {format(new Date(payment.receivedAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-400 whitespace-nowrap">
                      <CurrencyDisplay value={payment.amount} compact />
                    </td>
                    <td className="px-4 py-3 text-zinc-400 whitespace-nowrap">
                      {methodLabel(payment.method)}
                    </td>
                    <td className="px-4 py-3 font-mono text-zinc-400 text-xs">
                      {payment.reference || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {payment.allocations.map((alloc) => (
                          <div key={alloc.id} className="flex items-center gap-2 text-xs">
                            <Link
                              href={`/customers/${alloc.invoice.customer.id}`}
                              className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
                            >
                              {alloc.invoice.customer.name}
                            </Link>
                            <span className="text-zinc-600">·</span>
                            <span className="font-mono text-zinc-400">{alloc.invoice.invoiceNumber}</span>
                            <span className="text-zinc-600">·</span>
                            <span className="text-emerald-400 font-semibold">
                              <CurrencyDisplay value={alloc.amount} compact />
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function InvoicesPaymentsView({
  invoices,
  payments,
  defaultTab = 'invoices',
}: {
  invoices: Invoice[]
  payments: Payment[]
  defaultTab?: 'invoices' | 'payments'
}) {
  const [tab, setTab] = useState<'invoices' | 'payments'>(defaultTab)

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-surface-border">
        {([
          { key: 'invoices', label: 'Invoices', icon: FileText, count: invoices.length },
          { key: 'payments', label: 'Payments', icon: CreditCard, count: payments.length },
        ] as const).map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              tab === key
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === key ? 'bg-brand-500/20 text-brand-300' : 'bg-surface-border text-zinc-500'}`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {tab === 'invoices' ? (
        <InvoiceTable invoices={invoices} />
      ) : (
        <PaymentTable payments={payments} />
      )}
    </div>
  )
}
