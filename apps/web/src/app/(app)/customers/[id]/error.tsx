'use client'

import React, { useEffect } from 'react'
import { ErrorState } from '@/components/shared/error-state'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function CustomerProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Customer Profile Error:', error)
  }, [error])

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      <div>
        <Link 
          href="/customers" 
          className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Customers
        </Link>
      </div>
      <div className="flex h-[calc(100vh-15rem)] items-center justify-center">
        <ErrorState 
          title="Profile not found" 
          description="We couldn't load this customer's profile. They may not exist or you don't have access."
          retry={reset}
          className="w-full max-w-md shadow-2xl"
        />
      </div>
    </div>
  )
}
