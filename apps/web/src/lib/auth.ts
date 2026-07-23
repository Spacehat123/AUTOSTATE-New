import { auth, clerkClient } from '@clerk/nextjs/server'
import { prisma, getTenantDb } from '@autostate/database'
import { redirect } from 'next/navigation'
import { provisionUser } from '@/lib/services/users'

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
    const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null

    const provisionedUser = await provisionUser({
      clerkId: userId,
      email: primaryEmail || '',
      name,
      publicMetadata: clerkUser.publicMetadata
    })

    if (provisionedUser) {
      const db = getTenantDb(provisionedUser.companyId)
      return { ...provisionedUser, db }
    }

    redirect('/onboarding')
  }
  
  const db = getTenantDb(user.companyId)
  
  return { ...user, db }
}
