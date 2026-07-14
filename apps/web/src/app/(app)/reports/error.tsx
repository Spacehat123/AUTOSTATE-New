'use client'

import { ErrorState } from '@/components/ui/error-state'

export default function ReportsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="h-[60vh] flex items-center justify-center">
      <ErrorState 
        title="Failed to load reports"
        description={error.message || "Something went wrong while fetching your financial metrics."}
        retryAction={reset}
      />
    </div>
  )
}
