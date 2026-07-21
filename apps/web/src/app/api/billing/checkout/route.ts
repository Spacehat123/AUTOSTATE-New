import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { requireRole, InsufficientRoleError, roleErrorResponse } from '@/lib/rbac'
import { getBillingProvider } from '@/lib/billing'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()

  try {
    // Only the OWNER can manage billing
    requireRole(user, 'OWNER')
  } catch (error) {
    if (error instanceof InsufficientRoleError) {
      return roleErrorResponse()
    }
    throw error
  }

  try {
    const { variantId } = await request.json()

    if (!variantId) {
      return NextResponse.json({ error: 'variantId is required' }, { status: 400 })
    }

    const provider = getBillingProvider()
    const { url } = await provider.createCheckout({
      email: user.email,
      name: user.name || undefined,
      companyId: user.companyId,
      variantId,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=true`,
    })

    return NextResponse.json({ url })
  } catch (error) {
    console.error('[BILLING_CHECKOUT]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
