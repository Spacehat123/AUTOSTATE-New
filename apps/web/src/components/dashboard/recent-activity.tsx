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
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
        <Activity className="w-3.5 h-3.5" />
        Activity
      </h2>
      
      {!activities || activities.length === 0 ? (
        <div className="text-sm text-muted-foreground py-2">It's quiet here.</div>
      ) : (
        <div className="relative pl-3 border-l border-surface-border/50 space-y-8">
          {activities.map(activity => (
            <div key={activity.id} className="relative group">
              <div className="absolute -left-[17px] top-0.5 w-5 h-5 rounded-full bg-background border border-surface-border/50 flex items-center justify-center">
                {getIcon(activity.type)}
              </div>
              <div className="pl-4 flex flex-col">
                <span className="text-sm text-foreground">{activity.text}</span>
                <span className="text-xs text-muted-foreground mt-1">
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
