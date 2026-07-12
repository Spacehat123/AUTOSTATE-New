import { auth } from '@clerk/nextjs/server'
import { prisma } from '@autostate/database'
import { redirect } from 'next/navigation'

export async function getCurrentUser() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { company: true },
  })

  if (!user) redirect('/onboarding')
  return user
}
