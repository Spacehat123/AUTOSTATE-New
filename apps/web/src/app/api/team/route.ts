import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { requireRole, InsufficientRoleError, roleErrorResponse } from '@/lib/rbac'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()

  try {
    requireRole(user, 'ADMIN')
  } catch (error) {
    if (error instanceof InsufficientRoleError) return roleErrorResponse()
    throw error
  }

  try {
    const users = await user.db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('[TEAM_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
