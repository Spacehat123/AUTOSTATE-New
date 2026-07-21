import { auth, clerkClient } from '@clerk/nextjs/server'
import { prisma, getTenantDb } from '@autostate/database'
import { redirect } from 'next/navigation'

export async function getCurrentUser() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { company: true },
  })

  if (!user) {
    const client = await clerkClient()
    const clerkUser = await client.users.getUser(userId)
    const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress

    if (primaryEmail) {
      const pendingUser = await prisma.user.findFirst({
        where: { email: primaryEmail, clerkId: { startsWith: 'invite_' } }
      })

      if (pendingUser) {
        const linkedUser = await prisma.user.update({
          where: { id: pendingUser.id },
          data: { 
            clerkId: userId,
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null
          },
          include: { company: true }
        })
        const db = getTenantDb(linkedUser.companyId)
        return { ...linkedUser, db }
      }
    }

    redirect('/onboarding')
  }
  
  const db = getTenantDb(user.companyId)
  
  return { ...user, db }
}
