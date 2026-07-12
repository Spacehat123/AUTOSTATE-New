'use client'

import React, { useEffect } from 'react'
import { ErrorState } from '@/components/shared/error-state'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard Error:', error)
  }, [error])

  return (
    <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
      <ErrorState 
        title="Dashboard failed to load" 
        description="An error occurred while securely fetching your company data. Please try again."
        retry={reset}
        className="w-full max-w-md shadow-2xl"
      />
    </div>
  )
}
