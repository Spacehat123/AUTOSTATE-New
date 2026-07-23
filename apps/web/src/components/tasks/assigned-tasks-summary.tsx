import React from 'react'
import { ClipboardList, Calendar } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { format } from 'date-fns'

export interface AssignedTasksSummaryProps {
  tasks: any[]
}

export function AssignedTasksSummary({ tasks = [] }: AssignedTasksSummaryProps) {
  const displayTasks = tasks.slice(0, 5)

  return (
    <div className="flex flex-col gap-4 mb-8">
      <h2 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
        <ClipboardList className="w-5 h-5 text-brand-500" />
        Assigned Tasks ({tasks.length})
      </h2>

      <Card className="bg-surface-card border-surface-border overflow-hidden">
        {tasks.length === 0 ? (
          <div className="py-6 px-4 text-center text-zinc-500 text-sm">
            No tasks assigned to you.
          </div>
        ) : (
          <div className="flex flex-col">
            {displayTasks.map(task => (
              <div 
                key={task.id} 
                className="flex flex-col p-3 px-4 border-b border-surface-border/50 last:border-0 hover:bg-white/5 transition-colors gap-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-foreground truncate">
                    {task.customer?.name || 'Unknown Customer'}
                  </span>
                  {task.dueDate && (
                    <div className="flex items-center text-xs text-zinc-400 shrink-0 gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(task.dueDate), 'MMM d, yyyy')}
                    </div>
                  )}
                </div>
                <div className="text-xs text-zinc-400 line-clamp-1">
                  {task.reason || task.reasonText}
                </div>
              </div>
            ))}
            {tasks.length > 5 && (
              <div className="p-2 text-center border-t border-surface-border/50">
                <span className="text-xs text-brand-500 cursor-default">
                  +{tasks.length - 5} more
                </span>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
