import React from 'react'
import { CheckCircle2, MessageCircle, MessageSquare, Activity } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export function RecentActivity({ activities = [] }: { activities?: any[] }) {
  const getIcon = (type: string) => {
    if (type === 'PAYMENT') return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
    if (type === 'MESSAGE_RECEIVED') return <MessageCircle className="w-3.5 h-3.5 text-brand-500" />
    return <MessageSquare className="w-3.5 h-3.5 text-brand-500" />
  }

  return (
    <div className="bg-surface-card rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-surface-border h-full min-h-[500px]">
      <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-8 flex items-center gap-2">
        <Activity className="w-4 h-4" />
        Activity
      </h2>
      
      {!activities || activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full pb-12 text-center mt-20">
          <div className="w-24 h-24 bg-brand-500/5 rounded-full flex items-center justify-center mb-6 border border-brand-500/10">
            <MessageCircle className="w-10 h-10 text-brand-500 opacity-60" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2 tracking-tight">It's quiet here.</h3>
          <p className="text-sm text-muted-foreground max-w-[200px]">We'll show your latest updates and activities here.</p>
        </div>
      ) : (
        <div className="relative pl-3 border-l border-surface-border/50 space-y-8 mt-4">
          {activities.map(activity => (
            <div key={activity.id} className="relative group">
              <div className="absolute -left-[17px] top-0.5 w-5 h-5 rounded-full bg-background border border-surface-border/50 flex items-center justify-center shadow-sm">
                {getIcon(activity.type)}
              </div>
              <div className="pl-4 flex flex-col">
                <span className="text-sm font-semibold text-foreground">{activity.text}</span>
                <span className="text-xs font-medium text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
