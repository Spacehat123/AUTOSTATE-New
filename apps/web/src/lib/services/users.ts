import { prisma, User } from '@autostate/database'
import { clerkClient } from '@clerk/nextjs/server'
import { logger } from '@autostate/shared'

/**
 * Safely removes a user from the database.
 * If the user is an OWNER, it will archive the company instead of deleting it.
 */
export async function removeUserAndArchiveCompany(user: User) {
  try {
    if (user.role === 'OWNER') {
      await prisma.$transaction([
        prisma.company.update({
          where: { id: user.companyId },
          data: { isArchived: true }
        }),
        prisma.user.delete({
          where: { id: user.id }
        })
      ])
      logger.info({ userId: user.clerkId, companyId: user.companyId }, 'Owner deleted, company archived')
    } else {
      await prisma.user.delete({
        where: { id: user.id }
      })
      logger.info({ userId: user.clerkId }, 'User deleted from database')
    }
  } catch (error) {
    logger.error({ error, userId: user.clerkId }, 'Error deleting user from database')
    throw error // Re-throw to allow callers to handle/fail safely
  }
}

/**
 * Checks if a user genuinely exists in Clerk.
 * If they do NOT exist (e.g., deleted from Clerk dashboard), it safely purges them from the local database.
 * Returns true if the user was reconciled (purged) and is safe to overwrite.
 * Returns false if the user is healthy (exists) or if reconciliation failed.
 */
export async function reconcileUser(existingUser: User): Promise<boolean> {
  const client = await clerkClient()
  let isGhost = false

  try {
    try {
      await client.users.getUser(existingUser.clerkId)
    } catch (error: any) {
      if (error.status === 404) {
        isGhost = true
      } else {
        logger.warn({ error, clerkId: existingUser.clerkId }, 'Failed to fetch user during reconciliation')
        return false
      }
    }

    if (isGhost) {
      logger.info({ clerkId: existingUser.clerkId }, 'Ghost user detected, initiating cleanup')
      await removeUserAndArchiveCompany(existingUser)
      return true
    }

    return false
  } catch (error) {
    logger.error({ error, clerkId: existingUser.clerkId }, 'Fatal error during user reconciliation')
    return false
  }
}

export interface ProvisionUserData {
  clerkId: string
  email: string
  name?: string | null
  publicMetadata?: Record<string, any> | null
}

/**
 * Shared service for provisioning users in the database.
 * Used by both Clerk Webhooks and Authentication runtime fallback.
 */
export async function provisionUser(data: ProvisionUserData) {
  const { clerkId, email, name, publicMetadata } = data

  if (!publicMetadata || typeof publicMetadata.companyId !== 'string' || typeof publicMetadata.role !== 'string') {
    return null
  }

  const companyId = publicMetadata.companyId
  const role = publicMetadata.role as 'OWNER' | 'ADMIN' | 'MEMBER'

  const existingUser = await prisma.user.findUnique({
    where: { clerkId },
    include: { company: true }
  })

  if (existingUser) return existingUser

  try {
    const newUser = await prisma.user.create({
      data: {
        clerkId,
        email: email || '',
        name: name || null,
        companyId,
        role
      },
      include: { company: true }
    })
    logger.info({ userId: clerkId, companyId, role }, 'User successfully provisioned')
    return newUser
  } catch (error: any) {
    if (error.code === 'P2002') {
      const user = await prisma.user.findUnique({
        where: { clerkId },
        include: { company: true }
      })
      if (user) return user
    }
    logger.error({ error, userId: clerkId, companyId }, 'Error provisioning user')
    throw error
  }
}
