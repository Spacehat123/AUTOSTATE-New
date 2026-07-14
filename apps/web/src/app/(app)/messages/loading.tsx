import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export default function MessagesLoading() {
  return (
    <div className="flex flex-col gap-4 pb-4">
      <div>
        <Skeleton className="h-9 w-40 mb-2 bg-surface-border/50" />
        <Skeleton className="h-4 w-72 bg-surface-border/50" />
      </div>
      <div className="flex h-[calc(100vh-7rem)] rounded-xl border border-surface-border bg-surface-card overflow-hidden">
        {/* Inbox skeleton */}
        <div className="w-1/3 border-r border-surface-border flex flex-col gap-0">
          <div className="px-4 py-3 border-b border-surface-border">
            <Skeleton className="h-4 w-28 bg-surface-border/50" />
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-4 border-b border-surface-border/50">
              <Skeleton className="w-11 h-11 rounded-full flex-shrink-0 bg-surface-border/50" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-3/4 bg-surface-border/50" />
                <Skeleton className="h-3 w-full bg-surface-border/30" />
              </div>
            </div>
          ))}
        </div>
        {/* Detail skeleton */}
        <div className="flex-1 flex items-center justify-center">
          <Skeleton className="h-16 w-64 bg-surface-border/30 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
