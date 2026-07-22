import { NextRequest, NextResponse } from 'next/server'
import { prisma, logAction } from '@autostate/database'
import crypto from 'crypto'
import { getCurrentUser } from '@/lib/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser()

  try {
    const customer = await prisma.customer.findUnique({
      where: { id, companyId: user.companyId }
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const rawToken = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // Valid for 7 days

    await prisma.portalAccessToken.create({
      data: {
        customerId: customer.id,
        tokenHash,
        expiresAt
      }
    })

    logAction(user.companyId, user.id, 'customer.portal_link_generated', 'customer', customer.id)

    const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/portal/${rawToken}`

    return NextResponse.json({ url: portalUrl })
  } catch (error) {
    console.error('[PORTAL_LINK_POST]', error)
    return NextResponse.json(
      { error: 'Failed to generate portal link' },
      { status: 500 }
    )
  }
}
