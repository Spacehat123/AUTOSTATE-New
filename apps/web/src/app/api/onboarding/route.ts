import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@autostate/database'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const user = await currentUser()
    if (!user) {
      return new NextResponse('User not found in Clerk', { status: 404 })
    }

    const body = await req.json()
    const { companyName, gstNumber, phone } = body

    if (!companyName) {
      return new NextResponse('Company name is required', { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (existingUser) {
      return new NextResponse('User already onboarded', { status: 400 })
    }

    const primaryEmail = user.emailAddresses[0]?.emailAddress || ''
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim()

    // Create Company and User in a transaction
    const [company, dbUser] = await prisma.$transaction(async (tx) => {
      const newCompany = await tx.company.create({
        data: {
          name: companyName,
          gstNumber: gstNumber || null,
          phone: phone || null,
        },
      })

      const newUser = await tx.user.create({
        data: {
          clerkId: userId,
          email: primaryEmail,
          name: fullName || null,
          role: 'OWNER',
          companyId: newCompany.id,
        },
      })

      return [newCompany, newUser]
    })

    return NextResponse.json({ success: true, company, user: dbUser })
  } catch (error) {
    console.error('[ONBOARDING_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
