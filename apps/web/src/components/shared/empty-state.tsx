import React from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action, className, ...props }: EmptyStateProps) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-4",
        "border-2 border-dashed border-surface-border rounded-xl bg-surface/30",
        className
      )} 
      {...props}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-card border border-surface-border mb-6 shadow-inner">
        <div className="text-zinc-400 [&>svg]:h-10 [&>svg]:w-10">
          {icon}
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-white mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-zinc-500 max-w-sm mb-8">{description}</p>
      
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  )
}
