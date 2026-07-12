import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getDashboardData } from '@/lib/services/dashboard'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getCurrentUser()

  try {
    const data = await getDashboardData(user.companyId)
    return NextResponse.json(data)
  } catch (error) {
    console.error('[DASHBOARD_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
