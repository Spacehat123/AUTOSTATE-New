import React from 'react'
import { CurrencyDisplay } from '@/components/shared/currency-display'

interface MetricsGroupProps {
  outstanding: number
  predicted: number
  recovered: number
}

export function MetricsGroup({ outstanding, predicted, recovered }: MetricsGroupProps) {
  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-2 shadow-sm relative overflow-hidden">
      <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-surface-border">
        <div className="flex-1 p-6 transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-default rounded-lg">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-rose-500/80 mb-3">Outstanding</p>
          <p className="text-3xl font-medium text-foreground tracking-tight">
            <CurrencyDisplay value={outstanding} />
          </p>
        </div>
        
        <div className="flex-1 p-6 transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-default rounded-lg">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-500/80 mb-3">Predicted</p>
          <p className="text-3xl font-medium text-foreground tracking-tight">
            <CurrencyDisplay value={predicted} />
          </p>
        </div>
        
        <div className="flex-1 p-6 transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-default rounded-lg">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-500/80 mb-3">Recovered</p>
          <p className="text-3xl font-medium text-foreground tracking-tight">
            <CurrencyDisplay value={recovered} />
          </p>
        </div>
      </div>
    </div>
  )
}
