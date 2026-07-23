import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { requireAuthorizedUser, InsufficientRoleError, roleErrorResponse } from '@/lib/rbac'
import { prisma } from '@autostate/database'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()

  try {
    requireAuthorizedUser(user)
  } catch (error) {
    if (error instanceof InsufficientRoleError) return roleErrorResponse()
    throw error
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '50', 10)
  const entityType = searchParams.get('entityType')
  const userId = searchParams.get('userId')
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  const where: any = { companyId: user.companyId }

  if (entityType) {
    where.entityType = entityType
  }
  
  if (userId) {
    where.userId = userId
  }

  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) where.createdAt.gte = new Date(startDate)
    if (endDate) where.createdAt.lte = new Date(endDate)
  }

  try {
    const total = await prisma.auditLog.count({ where })
    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      // We don't have a direct relation setup for user yet in the prisma schema for audit log,
      // but we can join manually or since they are in the same DB, let's just fetch users.
    })

    // Fetch user details manually since we didn't set up a Prisma relation for `AuditLog.userId -> User.id`
    const userIds = [...new Set(logs.map(log => log.userId))]
    const users = await user.db.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true }
    })
    const userMap = new Map(users.map(u => [u.id, u]))

    const data = logs.map(log => ({
      ...log,
      user: userMap.get(log.userId) || { name: 'Unknown', email: '' }
    }))

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('[AUDIT_LOG_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
