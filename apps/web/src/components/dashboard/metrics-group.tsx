import React from 'react'
import { CurrencyDisplay } from '@/components/shared/currency-display'
import { Wallet, TrendingUp, Download } from 'lucide-react'

interface MetricsGroupProps {
  outstanding: number
  predicted: number
  recovered: number
}

export function MetricsGroup({ outstanding, predicted, recovered }: MetricsGroupProps) {
  let outTheme = { text: 'text-rose-500', bg: 'bg-rose-500/10' }
  if (outstanding < 10000) {
    outTheme = { text: 'text-emerald-500', bg: 'bg-emerald-500/10' }
  } else if (outstanding < 100000) {
    outTheme = { text: 'text-amber-500', bg: 'bg-amber-500/10' }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Outstanding Card */}
      <div className="bg-surface-card rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-surface-border">
        <div className="flex justify-between items-start mb-4">
          <span className={`text-[11px] font-bold tracking-wider ${outTheme.text} uppercase`}>Outstanding</span>
          <div className={`w-10 h-10 rounded-xl ${outTheme.bg} flex items-center justify-center ${outTheme.text}`}>
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div className="text-3xl font-semibold text-foreground tracking-tight mb-4">
          <CurrencyDisplay value={outstanding} />
        </div>
        <div className="flex items-center gap-2">
          <span className={`${outTheme.bg} ${outTheme.text} text-[11px] font-semibold px-2 py-0.5 rounded-md tracking-wide`}>- 0%</span>
          <span className="text-xs text-muted-foreground font-medium">vs last week</span>
        </div>
      </div>
      
      {/* Predicted Card */}
      <div className="bg-surface-card rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-surface-border">
        <div className="flex justify-between items-start mb-4">
          <span className="text-[11px] font-bold tracking-wider text-brand-500 uppercase">Predicted</span>
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="text-3xl font-semibold text-foreground tracking-tight mb-4">
          <CurrencyDisplay value={predicted} />
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-brand-500/10 text-brand-500 text-[11px] font-semibold px-2 py-0.5 rounded-md tracking-wide">- 0%</span>
          <span className="text-xs text-muted-foreground font-medium">vs last week</span>
        </div>
      </div>
      
      {/* Recovered Card */}
      <div className="bg-surface-card rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-surface-border">
        <div className="flex justify-between items-start mb-4">
          <span className="text-[11px] font-bold tracking-wider text-emerald-500 uppercase">Recovered</span>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Download className="w-5 h-5" />
          </div>
        </div>
        <div className="text-3xl font-semibold text-foreground tracking-tight mb-4">
          <CurrencyDisplay value={recovered} />
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-emerald-500/10 text-emerald-500 text-[11px] font-semibold px-2 py-0.5 rounded-md tracking-wide">- 0%</span>
          <span className="text-xs text-muted-foreground font-medium">vs last week</span>
        </div>
      </div>
    </div>
  )
}
