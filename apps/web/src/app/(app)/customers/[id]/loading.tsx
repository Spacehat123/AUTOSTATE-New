import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft } from 'lucide-react'

export default function CustomerProfileLoading() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-12">
      <div className="inline-flex items-center text-zinc-500">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Customers
      </div>
      
      <div>
        <Skeleton className="h-10 w-64 mb-4 bg-surface-border/50" />
        <Skeleton className="h-6 w-48 bg-surface-border/50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        <div className="flex flex-col gap-6">
          <Skeleton className="h-32 w-full bg-surface-border/50 rounded-xl" />
          <Skeleton className="h-96 w-full bg-surface-border/50 rounded-xl" />
        </div>
        <div className="flex flex-col gap-6">
          <Skeleton className="h-40 w-full bg-surface-border/50 rounded-xl" />
          <Skeleton className="h-96 w-full bg-surface-border/50 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
