import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth'
import { requireRole, InsufficientRoleError, roleErrorResponse } from '@/lib/rbac'
import { clerkClient } from '@clerk/nextjs/server'
import { Prisma, prisma } from '@autostate/database'
import { reconcileUser } from '@/lib/services/users'

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER']).default('MEMBER'),
  forceResend: z.boolean().optional()
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

    const { email, role, forceResend } = parsed.data

    // Check if user already exists globally to avoid unique constraint violations.
    // We explicitly bypass the tenant client here because emails are globally unique, 
    // and a user can only belong to one company.
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      const reconciled = await reconcileUser(existingUser)
      
      if (!reconciled) {
        if (existingUser.companyId === currentUser.companyId) {
          return NextResponse.json({ error: 'User is already in this company' }, { status: 400 })
        }
        return NextResponse.json({ error: 'User already belongs to another company' }, { status: 400 })
      }
    }

    // Call Clerk to create invitation
    const client = await clerkClient()
    
    // Explicitly set the redirect URL so Clerk knows where to send them after they click the email link.
    // It MUST point to a page rendering the <SignUp /> component so the invitation ticket is redeemed!
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || 'http://localhost:3000'
    const redirectUrl = `${appUrl}/sign-up`
    
    // First, try with ignoreExisting: true. If there's an existing one (pending or revoked), Clerk returns it.
    let invitation = await client.invitations.createInvitation({
      emailAddress: email,
      publicMetadata: { companyId: currentUser.companyId, role },
      notify: true,
      ignoreExisting: true,
      redirectUrl
    })

    if (invitation.status === 'pending') {
      if (forceResend) {
        // Revoke the old pending invite and create a fresh one to guarantee email delivery
        await client.invitations.revokeInvitation(invitation.id)
        invitation = await client.invitations.createInvitation({
          emailAddress: email,
          publicMetadata: { companyId: currentUser.companyId, role },
          notify: true,
          ignoreExisting: false,
          redirectUrl
        })
      } else {
        // Return 409 Conflict with a special flag so the frontend can prompt the user
        return NextResponse.json({ 
          error: 'An invitation has already been sent to this email.',
          isDuplicate: true 
        }, { status: 409 })
      }
    } else if (invitation.status === 'revoked') {
      // The old invite was revoked. We can safely create a new one.
      invitation = await client.invitations.createInvitation({
        emailAddress: email,
        publicMetadata: { companyId: currentUser.companyId, role },
        notify: true,
        ignoreExisting: false,
        redirectUrl
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Invitation sent via Clerk',
      invitationId: invitation.id 
    })
  } catch (error) {
    console.error('[TEAM_INVITE_POST]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
