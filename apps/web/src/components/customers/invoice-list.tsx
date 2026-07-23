'use client'

import React from 'react'
import { format, differenceInDays } from 'date-fns'
import { CurrencyDisplay } from '@/components/shared/currency-display'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/components/shared/empty-state'
import { FileText } from 'lucide-react'

export function InvoiceList({ invoices }: { invoices: any[] }) {
  if (!invoices || invoices.length === 0) {
    return (
      <div className="border border-surface-border rounded-xl bg-surface-card overflow-hidden">
        <div className="h-48 flex items-center justify-center">
          <EmptyState 
            icon={<FileText />}
            title="No Invoices"
            description="This customer has no recorded invoices."
            className="border-none bg-transparent"
          />
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
      case 'OVERDUE': return 'bg-rose-500/10 text-rose-400 border-rose-500/20'
      case 'PARTIAL': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      case 'PAID': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'DISPUTED': return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
      default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [filter, setFilter] = React.useState<string>('ALL')
  const statuses = ['ALL', 'PENDING', 'OVERDUE', 'PAID']

  const filteredInvoices = invoices.filter(inv => filter === 'ALL' || inv.status === filter)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              filter === s
                ? 'bg-brand-500 border-brand-500 text-white'
                : 'border-surface-border text-zinc-400 hover:text-white hover:border-zinc-600'
            }`}
          >
            {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>
      <div className="rounded-xl border border-surface-border bg-surface-card overflow-hidden">
        <Table>
        <TableHeader className="bg-surface-border/20">
          <TableRow className="hover:bg-transparent border-surface-border">
            <TableHead className="font-semibold text-zinc-400 pl-6">Invoice</TableHead>
            <TableHead className="font-semibold text-zinc-400">Amount</TableHead>
            <TableHead className="font-semibold text-zinc-400">Due Date</TableHead>
            <TableHead className="font-semibold text-zinc-400">Timeline</TableHead>
            <TableHead className="font-semibold text-zinc-400 pr-6 text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredInvoices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-12 text-zinc-500 text-sm border-none">
                No invoices match the selected status.
              </TableCell>
            </TableRow>
          ) : (
            filteredInvoices.map((inv) => {
              const dueDate = new Date(inv.dueDate)
            const diffDays = differenceInDays(today, dueDate) // positive if today > dueDate
            
            return (
              <TableRow key={inv.id} className="border-surface-border hover:bg-white/5 transition-colors">
                <TableCell className="font-medium text-foreground pl-6">
                  {inv.invoiceNumber}
                </TableCell>
                <TableCell>
                  <CurrencyDisplay value={inv.amount} compact className="text-foreground font-medium" />
                  {Number(inv.outstandingAmount) < Number(inv.amount) && Number(inv.outstandingAmount) > 0 && (
                    <div className="text-xs text-zinc-500 mt-0.5">
                      Bal: <CurrencyDisplay value={inv.outstandingAmount} compact />
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-zinc-400">
                  {format(dueDate, 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  {inv.status === 'PAID' ? (
                    <span className="text-zinc-500">-</span>
                  ) : diffDays > 0 ? (
                    <span className="text-rose-400 font-medium">{diffDays} days overdue</span>
                  ) : diffDays === 0 ? (
                    <span className="text-amber-400 font-medium">Due today</span>
                  ) : (
                    <span className="text-emerald-400 font-medium">Due in {Math.abs(diffDays)} days</span>
                  )}
                </TableCell>
                <TableCell className="text-right pr-6">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusColor(inv.status)}`}>
                    {inv.status}
                  </span>
                </TableCell>
              </TableRow>
            )
            })
          )}
        </TableBody>
      </Table>
    </div>
    </div>
  )
}
