import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getCustomerById } from '@/lib/services/customers'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()

  try {
    const { id } = await params
    const result = await getCustomerById(id, user.companyId)

    if (result.error) {
      return NextResponse.json(
        { error: result.error }, 
        { status: result.status }
      )
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error('[CUSTOMER_DETAIL_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
