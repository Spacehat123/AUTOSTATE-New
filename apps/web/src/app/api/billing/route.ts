import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    const subscription = await user.db.subscription.findUnique({
      where: { companyId: user.companyId },
    })

    // Get limits from plan-limits.ts based on the current plan
    const { PLAN_LIMITS } = await import('@/lib/plan-limits')
    const currentPlan = subscription?.plan.toUpperCase() as keyof typeof PLAN_LIMITS || 'FREE'
    const limits = PLAN_LIMITS[currentPlan] || PLAN_LIMITS.FREE

    const customersCount = await user.db.customer.count({
      where: { companyId: user.companyId }
    })
    
    const usersCount = await user.db.user.count({
      where: { companyId: user.companyId }
    })

    return NextResponse.json({
      subscription: subscription || { plan: 'FREE', status: 'TRIALING' },
      limits,
      usage: {
        customers: customersCount,
        users: usersCount
      }
    })
  } catch (error) {
    console.error('[BILLING_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
