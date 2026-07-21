import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth'
import { requireRole, InsufficientRoleError, roleErrorResponse } from '@/lib/rbac'
import { clerkClient } from '@clerk/nextjs/server'

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER']).default('MEMBER')
})

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser()

  try {
    requireRole(currentUser, 'ADMIN') // ADMIN+ can invite
  } catch (error) {
    if (error instanceof InsufficientRoleError) return roleErrorResponse()
    throw error
  }

  try {
    const body = await request.json()
    const parsed = inviteSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.format() }, { status: 400 })
    }

    const { email, role } = parsed.data

    // Check if user already exists in this company (or anywhere)
    const existingUser = await currentUser.db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User is already in this company' }, { status: 400 })
    }

    // Call Clerk to create invitation
    const client = await clerkClient()
    const invitation = await client.invitations.createInvitation({
      emailAddress: email,
      publicMetadata: { companyId: currentUser.companyId, role },
      ignoreExisting: true
    })

    // Store pending user
    const pendingUser = await currentUser.db.user.create({
      data: {
        clerkId: `invite_${invitation.id}`,
        email,
        role,
        name: null,
        companyId: currentUser.companyId
      }
    })

    return NextResponse.json(pendingUser)
  } catch (error) {
    console.error('[TEAM_INVITE_POST]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
