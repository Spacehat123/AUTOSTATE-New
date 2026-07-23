import React from 'react'
import { CurrencyDisplay } from '@/components/shared/currency-display'
import { Wallet, AlertCircle, Download, Clock } from 'lucide-react'

interface MetricsGroupProps {
  totalOutstanding: number
  totalOverdue: number
  cashCollectedThisMonth: number
  activePromisesToPay: number
}

export function MetricsGroup({ totalOutstanding, totalOverdue, cashCollectedThisMonth, activePromisesToPay }: MetricsGroupProps) {
  let overdueTheme = { text: 'text-rose-500', bg: 'bg-rose-500/10' }
  if (totalOverdue < 10000) {
    overdueTheme = { text: 'text-emerald-500', bg: 'bg-emerald-500/10' }
  } else if (totalOverdue < 100000) {
    overdueTheme = { text: 'text-amber-500', bg: 'bg-amber-500/10' }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Outstanding Card */}
      <div className="bg-surface-card rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-surface-border">
        <div className="flex justify-between items-start mb-4">
          <span className="text-[11px] font-bold tracking-wider text-blue-500 uppercase">Total Outstanding</span>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div className="text-3xl font-semibold text-foreground tracking-tight mb-4">
          <CurrencyDisplay value={totalOutstanding} />
        </div>
      </div>
      
      {/* Total Overdue Card */}
      <div className="bg-surface-card rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-surface-border">
        <div className="flex justify-between items-start mb-4">
          <span className={`text-[11px] font-bold tracking-wider ${overdueTheme.text} uppercase`}>Total Overdue</span>
          <div className={`w-10 h-10 rounded-xl ${overdueTheme.bg} flex items-center justify-center ${overdueTheme.text}`}>
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
        <div className="text-3xl font-semibold text-foreground tracking-tight mb-4">
          <CurrencyDisplay value={totalOverdue} />
        </div>
      </div>
      
      {/* Cash Collected This Month Card */}
      <div className="bg-surface-card rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-surface-border">
        <div className="flex justify-between items-start mb-4">
          <span className="text-[11px] font-bold tracking-wider text-emerald-500 uppercase">Cash Collected (Month)</span>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Download className="w-5 h-5" />
          </div>
        </div>
        <div className="text-3xl font-semibold text-foreground tracking-tight mb-4">
          <CurrencyDisplay value={cashCollectedThisMonth} />
        </div>
      </div>

      {/* Active Promises to Pay Card */}
      <div className="bg-surface-card rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-surface-border">
        <div className="flex justify-between items-start mb-4">
          <span className="text-[11px] font-bold tracking-wider text-brand-500 uppercase">Active Promises</span>
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="text-3xl font-semibold text-foreground tracking-tight mb-4">
          {activePromisesToPay}
        </div>
      </div>
    </div>
  )
}
