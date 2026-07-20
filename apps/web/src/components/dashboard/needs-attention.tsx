import React from 'react'
import { Flame, AlertTriangle, CheckCircle2, ClipboardList } from 'lucide-react'

export function NeedsAttention({ tasks = [] }: { tasks?: any[] }) {
  return (
    <div className="bg-surface-card rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-surface-border">
      <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-6 flex items-center gap-2">
        <Flame className="w-4 h-4" />
        Needs Attention
      </h2>
      
      {tasks.length === 0 ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">All clear. You have no urgent items.</span>
          </div>
          <div className="w-24 h-16 bg-brand-500/5 rounded-xl flex items-center justify-center border border-brand-500/10">
            <ClipboardList className="w-8 h-8 text-brand-300 opacity-50" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          {tasks.map(task => (
            <div key={task.id} className="group flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-surface-border/40 hover:border-foreground/20 transition-colors cursor-pointer gap-2 last:border-0 last:pb-0">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span className="font-semibold text-foreground text-sm">{task.customer?.name || 'Unknown'}</span>
                <span className="hidden sm:inline text-muted-foreground text-sm">—</span>
                <span className="text-sm text-muted-foreground font-medium">{task.reason}</span>
              </div>
              <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Review
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
