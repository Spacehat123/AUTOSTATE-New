import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getCustomers } from '@/lib/services/customers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Let Next.js handle the redirect if not authenticated
  const user = await getCurrentUser()
  
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || undefined
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const sortBy = searchParams.get('sortBy') || 'name'
    const sortOrder = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc'

    const data = await getCustomers({
      db: user.db,
      search,
      page,
      limit,
      sortBy,
      sortOrder
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('[CUSTOMERS_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
