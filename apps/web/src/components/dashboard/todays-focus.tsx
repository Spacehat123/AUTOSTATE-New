import React from 'react'
import { Calendar, CheckCircle2 } from 'lucide-react'
import { CurrencyDisplay } from '@/components/shared/currency-display'

export function TodaysFocus({ tasks = [] }: { tasks?: any[] }) {
  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
        <Calendar className="w-3.5 h-3.5" />
        Today
      </h2>
      
      {tasks.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>You're all caught up for today.</span>
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
              <div key={task.id} className="group relative flex flex-col gap-2 cursor-pointer pb-6 border-b border-surface-border/40 hover:border-foreground/20 transition-colors">
                <div className="flex items-start gap-4">
                  <span className="text-sm font-medium text-muted-foreground pt-0.5">{index + 1}.</span>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-foreground text-sm">{actionText} {task.customer?.name || 'Unknown'}</span>
                    <span className="text-sm text-muted-foreground">{task.reason}</span>
                    
                    <div className="mt-2 flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">
                        {Math.max(45, 98 - (task.customer?.riskScore || 0))}% response chance <span className="opacity-50">(based on history)</span>
                      </span>
                      {estimatedRecovery > 0 && (
                        <span className="text-sm font-medium text-brand-600 dark:text-brand-400 mt-1">
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
