import { auth } from '@clerk/nextjs/server'
import { prisma, getTenantDb } from '@autostate/database'
import { redirect } from 'next/navigation'

export async function getCurrentUser() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { company: true },
  })

  if (!user) redirect('/onboarding')
  
  const db = getTenantDb(user.companyId)
  
  return { ...user, db }
}
