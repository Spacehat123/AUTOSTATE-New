import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@autostate/database'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()

  try {
    if (user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Access Denied. Only owners can manage users.' }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      where: { companyId: user.companyId },
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
    console.error('[SETTINGS_USERS_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
