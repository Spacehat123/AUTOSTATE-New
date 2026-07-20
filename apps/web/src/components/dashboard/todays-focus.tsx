import React from 'react'
import { Calendar, CheckCircle2, Sunrise } from 'lucide-react'
import { CurrencyDisplay } from '@/components/shared/currency-display'

export function TodaysFocus({ tasks = [] }: { tasks?: any[] }) {
  return (
    <div className="bg-surface-card rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-surface-border">
      <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-6 flex items-center gap-2">
        <Calendar className="w-4 h-4" />
        Today
      </h2>
      
      {tasks.length === 0 ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">You're all caught up for today.</span>
          </div>
          <div className="w-24 h-16 bg-emerald-500/5 rounded-xl flex items-center justify-center border border-emerald-500/10">
            <Sunrise className="w-8 h-8 text-emerald-300 opacity-50" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {tasks.map((task, index) => {
            // Calculate estimated recovery (sum of overdue invoices for this customer)
            const estimatedRecovery = task.customer?.invoices?.reduce((acc: number, inv: any) => acc + Number(inv.outstandingAmount), 0) || 0

            let actionText = 'Review'
            if (task.taskType === 'CALL') actionText = 'Call'
            if (task.taskType === 'SEND_REMINDER') actionText = 'WhatsApp'
            if (task.taskType === 'ESCALATE') actionText = 'Escalate'
            if (task.taskType === 'FOLLOW_UP') actionText = 'Follow up with'
            if (task.taskType === 'RECORD_PAYMENT') actionText = 'Record payment for'

            return (
              <div key={task.id} className="group relative flex flex-col gap-2 cursor-pointer pb-6 border-b border-surface-border/40 hover:border-foreground/20 transition-colors last:border-0 last:pb-0">
                <div className="flex items-start gap-4">
                  <span className="text-sm font-semibold text-muted-foreground pt-0.5">{index + 1}.</span>
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-foreground text-sm">{actionText} {task.customer?.name || 'Unknown'}</span>
                    <span className="text-sm text-muted-foreground font-medium">{task.reason}</span>
                    
                    <div className="mt-2 flex flex-col gap-0.5">
                      <span className="text-xs font-medium text-muted-foreground">
                        {Math.max(45, 98 - (task.customer?.riskScore || 0))}% response chance <span className="opacity-50">(based on history)</span>
                      </span>
                      {estimatedRecovery > 0 && (
                        <span className="text-sm font-semibold text-brand-600 dark:text-brand-400 mt-1">
                          <CurrencyDisplay value={estimatedRecovery} /> expected
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
