import React from 'react'
import { Phone, MessageCircle, AlertTriangle, CheckSquare, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CurrencyDisplay } from '@/components/shared/currency-display'
import { EmptyState } from '@/components/shared/empty-state'

export interface TodaysWorkProps {
  tasks: any[]
}

const TYPE_LABELS: Record<string, string> = {
  CALL: 'Call',
  SEND_REMINDER: 'Send Reminder',
  ESCALATE: 'Escalate',
  FOLLOW_UP: 'Follow Up',
  RECORD_PAYMENT: 'Record Payment'
}

export function TodaysWork({ tasks }: TodaysWorkProps) {
  if (!tasks || tasks.length === 0) {
    return (
      <EmptyState 
        icon={<CheckSquare />}
        title="All caught up!"
        description="There are no pending tasks requiring your attention today. Great job!"
      />
    )
  }

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
      {tasks.map((task, index) => {
        // Fallbacks for data that might be coming from other joined models in the future
        const amount = task.amount || 0
        const daysOverdue = task.daysOverdue || 0

        return (
          <React.Fragment key={task.id}>
            {index > 0 && <Separator className="bg-surface-border/50" />}
            
            <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 hover:bg-white/5 transition-colors group">
              {/* Left: Number and Basic Info */}
              <div className="flex items-start gap-4 flex-1">
                <div className="w-8 h-8 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-500 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                  {index + 1}
                </div>
                
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-brand-500 uppercase tracking-wider bg-brand-500/10 px-2 py-0.5 rounded-full">
                      {TYPE_LABELS[task.taskType] || task.taskType}
                    </span>
                    {daysOverdue > 0 && (
                      <span className="text-xs text-rose-400 font-medium bg-rose-500/10 px-2 py-0.5 rounded-full">
                        {daysOverdue} days overdue
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-baseline gap-2 truncate">
                    <span className="text-lg font-bold text-foreground truncate">
                      {task.customer?.name || 'Unknown Customer'}
                    </span>
                    {amount > 0 && (
                      <span className="text-sm font-medium text-slate-400">
                        • <CurrencyDisplay value={amount} compact />
                      </span>
                    )}
                  </div>
                  
                  {task.reason && (
                    <p className="text-sm text-zinc-400 mt-1 line-clamp-1">
                      {task.reason}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Action Button */}
              <div className="flex-shrink-0 flex items-center pt-2 sm:pt-0 pl-12 sm:pl-0">
                {task.taskType === 'CALL' && (
                  <Button className="bg-brand-500 hover:bg-brand-600 text-white w-full sm:w-auto shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                )}
                {task.taskType === 'SEND_REMINDER' && (
                  <Button className="bg-brand-500 hover:bg-brand-600 text-white w-full sm:w-auto shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Generate Message
                  </Button>
                )}
                {task.taskType === 'ESCALATE' && (
                  <Button variant="destructive" className="w-full sm:w-auto shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Notify Owner
                  </Button>
                )}
                {/* Fallback for other types */}
                {!['CALL', 'SEND_REMINDER', 'ESCALATE'].includes(task.taskType) && (
                  <Button variant="outline" className="border-surface-border text-foreground hover:bg-zinc-100 dark:hover:bg-white/5 w-full sm:w-auto">
                    Take Action
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </React.Fragment>
        )
      })}
    </div>
  )
}
