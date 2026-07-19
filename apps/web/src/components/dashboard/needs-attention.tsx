import React from 'react'
import { Flame, AlertTriangle, CheckCircle2 } from 'lucide-react'

export function NeedsAttention({ tasks = [] }: { tasks?: any[] }) {
  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
        <Flame className="w-3.5 h-3.5" />
        Needs Attention
      </h2>
      
      {tasks.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>All clear. You have no urgent items.</span>
        </div>
      ) : (
        <div className="flex flex-col">
          {tasks.map(task => (
            <div key={task.id} className="group flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-surface-border/40 hover:border-foreground/20 transition-colors cursor-pointer gap-2">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span className="font-medium text-foreground text-sm">{task.customer?.name || 'Unknown'}</span>
                <span className="hidden sm:inline text-muted-foreground text-sm">—</span>
                <span className="text-sm text-muted-foreground">{task.reason}</span>
              </div>
              <span className="text-xs font-medium text-brand-600 dark:text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Review
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
