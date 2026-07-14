import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@autostate/database'
import { getCurrentUser } from '@/lib/auth'

const roleSchema = z.object({
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER'])
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentUser()

  try {
    if (currentUser.role !== 'OWNER') {
      return NextResponse.json({ error: 'Access Denied' }, { status: 403 })
    }

    const { id: targetUserId } = await params
    
    // Check if user exists and is in the same company
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId }
    })

    if (!targetUser || targetUser.companyId !== currentUser.companyId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Don't let the owner downgrade themselves
    if (targetUser.id === currentUser.id) {
      return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 })
    }

    const body = await request.json()
    const parsed = roleSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid role', details: parsed.error.format() }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: parsed.data.role },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('[SETTINGS_USERS_PATCH]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
