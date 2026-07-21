'use client'

import React from 'react'
import Link from 'next/link'
import { Phone, MessageSquare, AlertTriangle, Check, Clock, Calendar, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CurrencyDisplay } from '@/components/shared/currency-display'

export interface TaskCardProps {
  task: any
  onComplete: () => void
  onSnooze: () => void
}

const TYPE_LABELS: Record<string, string> = {
  CALL: 'Call',
  SEND_REMINDER: 'Send Reminder',
  ESCALATE: 'Escalate',
  FOLLOW_UP: 'Follow Up',
  RECORD_PAYMENT: 'Record Payment'
}

export function TaskCard({ task, onComplete, onSnooze }: TaskCardProps) {
  const isHighPriority = task.priority > 70
  const amount = task.amount || 0
  const daysOverdue = task.daysOverdue || 0

  const getPrimaryButton = () => {
    switch (task.taskType) {
      case 'CALL':
        return (
          <Button className="bg-brand-500 hover:bg-brand-600 text-white w-full shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <Phone className="w-4 h-4 mr-2" />
            Call
          </Button>
        )
      case 'SEND_REMINDER':
        return (
          <Button className="bg-brand-500 hover:bg-brand-600 text-white w-full shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <MessageSquare className="w-4 h-4 mr-2" />
            Message
          </Button>
        )
      case 'ESCALATE':
        return (
          <Button variant="destructive" className="w-full shadow-[0_0_15px_rgba(244,63,94,0.3)]">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Notify Owner
          </Button>
        )
      default:
        return (
          <Button variant="outline" className="border-surface-border text-foreground hover:bg-white/5 w-full">
            Take Action
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )
    }
  }

  return (
    <Card className={`bg-surface-card border-surface-border transition-all hover:border-brand-500/30 overflow-hidden ${isHighPriority ? 'border-l-4 border-l-rose-500' : ''}`}>
      <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        
        {/* Left Side: Context */}
        <div className="flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${isHighPriority ? 'bg-rose-500/10 text-rose-400' : 'bg-brand-500/10 text-brand-400'}`}>
              {TYPE_LABELS[task.taskType] || task.taskType}
            </span>
            {daysOverdue > 0 && (
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider bg-rose-500/10 px-2 py-0.5 rounded-full">
                {daysOverdue} days overdue
              </span>
            )}
            {isHighPriority && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 ml-1">
                HIGH PRIORITY
              </span>
            )}
          </div>
          
          <div className="flex items-baseline gap-2 truncate mt-1">
            <Link 
              href={`/customers/${task.customer?.id}`}
              className="text-lg font-bold text-foreground hover:text-brand-400 transition-colors truncate"
            >
              {task.customer?.name || 'Unknown Customer'}
            </Link>
            {amount > 0 && (
              <span className="text-sm font-medium text-zinc-400">
                • <CurrencyDisplay value={amount} compact />
              </span>
            )}
          </div>

          {(task.reason || task.reasonText) && (
            <p className="text-sm text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
              {task.reason || task.reasonText}
            </p>
          )}
        </div>

        {/* Right Side: Actions Grid */}
        <div className="flex flex-col gap-2 shrink-0 sm:w-48">
          {getPrimaryButton()}
          
          <div className="flex items-center justify-between gap-2 mt-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onComplete}
              className="flex-1 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 h-8 text-xs font-semibold"
            >
              <Check className="w-3.5 h-3.5 mr-1.5" />
              Done
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onSnooze} 
              className="flex-1 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 h-8 text-xs font-semibold"
            >
              <Clock className="w-3.5 h-3.5 mr-1.5" />
              Snooze
            </Button>
          </div>
        </div>
        
      </CardContent>
    </Card>
  )
}
