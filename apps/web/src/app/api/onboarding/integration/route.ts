import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@autostate/database'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!dbUser) {
      return new NextResponse('User not found', { status: 404 })
    }

    const body = await req.json()
    const { type, config } = body

    if (!type || !config) {
      return new NextResponse('Type and config are required', { status: 400 })
    }

    const integration = await prisma.companyIntegration.upsert({
      where: {
        companyId_type: {
          companyId: dbUser.companyId,
          type,
        },
      },
      update: {
        config,
      },
      create: {
        companyId: dbUser.companyId,
        type,
        config,
      },
    })

    return NextResponse.json({ success: true, integration })
  } catch (error) {
    console.error('[INTEGRATION_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
