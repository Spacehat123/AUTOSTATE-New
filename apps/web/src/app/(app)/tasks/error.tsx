'use client'

import React, { useEffect } from 'react'
import { ErrorState } from '@/components/shared/error-state'

export default function TasksError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Tasks Page Error:', error)
  }, [error])

  return (
    <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
      <ErrorState 
        title="Failed to load tasks" 
        description="An error occurred while fetching your task list."
        retry={reset}
        className="w-full max-w-md shadow-2xl"
      />
    </div>
  )
}
