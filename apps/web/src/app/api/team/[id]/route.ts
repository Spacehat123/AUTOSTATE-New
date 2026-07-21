import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth'
import { requireRole, InsufficientRoleError, roleErrorResponse } from '@/lib/rbac'

const roleSchema = z.object({
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER'])
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentUser()

  try {
    requireRole(currentUser, 'OWNER') // Only OWNER can change roles for now
  } catch (error) {
    if (error instanceof InsufficientRoleError) return roleErrorResponse()
    throw error
  }

  try {
    const { id: targetUserId } = await params
    
    // Check if user exists and is in the same company
    const targetUser = await currentUser.db.user.findUnique({
      where: { id: targetUserId }
    })

    if (!targetUser) {
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

    const updatedUser = await currentUser.db.user.update({
      where: { id: targetUserId },
      data: { role: parsed.data.role },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('[TEAM_PATCH]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentUser()

  try {
    requireRole(currentUser, 'OWNER') // Only OWNER can delete
  } catch (error) {
    if (error instanceof InsufficientRoleError) return roleErrorResponse()
    throw error
  }

  try {
    const { id: targetUserId } = await params
    
    const targetUser = await currentUser.db.user.findUnique({
      where: { id: targetUserId }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (targetUser.id === currentUser.id) {
      return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 })
    }

    await currentUser.db.user.delete({
      where: { id: targetUserId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[TEAM_DELETE]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
