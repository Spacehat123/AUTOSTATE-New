import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export default function CustomersLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="mb-8">
        <Skeleton className="h-8 w-48 mb-2 bg-surface-border/50" />
        <Skeleton className="h-4 w-64 bg-surface-border/50" />
      </div>

      <div className="flex flex-col space-y-4">
        <Skeleton className="h-10 w-full max-w-sm bg-surface-border/50 rounded-md" />
        
        <div className="rounded-xl border border-surface-border bg-surface-card overflow-hidden">
          <div className="h-12 border-b border-surface-border bg-surface-border/20 flex items-center px-4">
             <Skeleton className="h-4 w-full bg-surface-border/50" />
          </div>
          
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-16 border-b border-surface-border flex items-center px-4">
              <Skeleton className="h-4 w-full bg-surface-border/20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
