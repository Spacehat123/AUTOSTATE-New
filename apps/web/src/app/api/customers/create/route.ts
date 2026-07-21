import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  
  try {
    const { name, email, phone } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Check limits
    const subscription = await user.db.subscription.findUnique({
      where: { companyId: user.companyId },
    })

    const { PLAN_LIMITS } = await import('@/lib/plan-limits')
    const currentPlan = subscription?.plan.toUpperCase() as keyof typeof PLAN_LIMITS || 'FREE'
    const limits = PLAN_LIMITS[currentPlan] || PLAN_LIMITS.FREE

    const customersCount = await user.db.customer.count({
      where: { companyId: user.companyId }
    })

    if (customersCount >= limits.maxCustomers) {
      return NextResponse.json(
        { error: 'Customer limit reached. Please upgrade your plan.' }, 
        { status: 402 }
      )
    }

    const customer = await user.db.customer.create({
      data: {
        name,
        email,
        phone,
        companyId: user.companyId,
      }
    })

    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error('[CUSTOMERS_POST]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
