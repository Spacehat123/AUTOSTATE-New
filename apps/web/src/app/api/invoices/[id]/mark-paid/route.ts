import { NextResponse } from 'next/server'

/**
 * This endpoint is deprecated. All payment recording now goes through
 * POST /api/payments which supports allocations across multiple invoices.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        'This endpoint is no longer available. Use POST /api/payments with an allocations array instead.',
    },
    { status: 410 },
  )
}
