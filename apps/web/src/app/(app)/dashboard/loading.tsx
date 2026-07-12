import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="flex flex-col">
      <div className="mb-8">
        <Skeleton className="h-8 w-48 mb-2 bg-surface-border/50" />
        <Skeleton className="h-4 w-64 bg-surface-border/50" />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full bg-surface-border/50 rounded-xl" />
        ))}
      </div>
      
      <div className="mt-8">
        <Skeleton className="h-6 w-36 mb-4 bg-surface-border/50" />
        
        <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div className="h-px bg-surface-border/50 w-full" />}
              <Skeleton className="h-24 w-full bg-surface-border/20 rounded-none" />
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}
