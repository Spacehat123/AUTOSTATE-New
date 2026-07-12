import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export default function TasksLoading() {
  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-12">
      <div className="mb-2">
        <Skeleton className="h-10 w-48 mb-2 bg-surface-border/50" />
        <Skeleton className="h-5 w-64 bg-surface-border/50" />
      </div>

      <Skeleton className="h-10 w-full max-w-md bg-surface-border/50 rounded-lg" />

      <div className="flex flex-col gap-4 mt-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full bg-surface-border/50 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
