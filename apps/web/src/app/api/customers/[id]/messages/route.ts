import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@autostate/database'
import { getCurrentUser } from '@/lib/auth'
import { sendTextMessage } from '@/lib/whatsapp'

export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  content: z.string().min(1, 'Message cannot be empty'),
  type: z.enum(['WHATSAPP', 'EMAIL']).default('WHATSAPP')
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()

  try {
    const { id: customerId } = await params
    const body = await request.json()

    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const { content, type } = parsed.data

    // 1. Fetch customer and verify company ownership
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    if (customer.companyId !== user.companyId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    let whatsappId: string | undefined

    // 2. Send the message via WhatsApp if applicable
    if (type === 'WHATSAPP') {
      if (!customer.phone) {
        return NextResponse.json(
          { error: 'Customer has no phone number on record' },
          { status: 422 }
        )
      }

      const result = await sendTextMessage(customer.phone, content)
      whatsappId = result.whatsappId
    }

    // 3. Persist the outgoing message to the DB
    const message = await prisma.message.create({
      data: {
        customerId,
        direction: 'OUTGOING',
        type,
        content,
        timestamp: new Date(),
        ...(whatsappId ? { whatsappId } : {})
      }
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('[CUSTOMER_SEND_MESSAGE]', error)
    // Surface WhatsApp API errors clearly rather than swallowing them
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
