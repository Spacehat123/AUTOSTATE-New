import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth'
import { logAction } from '@autostate/database'
import { ratelimit } from '@autostate/shared'
import { sendTextMessage } from '@/lib/whatsapp'
import { sendEmail } from '@autostate/email'

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

  const { success } = await ratelimit.api.limit(user.id)
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

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

    // 1. Fetch customer and verify company ownership (handled by db)
    const customer = await user.db.customer.findUnique({
      where: { id: customerId }
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    let whatsappId: string | undefined
    let providerId: string | undefined

    // 2. Send the message via WhatsApp or Email
    if (type === 'WHATSAPP') {
      if (!customer.phone) {
        return NextResponse.json(
          { error: 'Customer has no phone number on record' },
          { status: 422 }
        )
      }

      const result = await sendTextMessage(customer.phone, content)
      whatsappId = result.whatsappId
    } else if (type === 'EMAIL') {
      if (!customer.email) {
        return NextResponse.json(
          { error: 'Customer has no email address on record' },
          { status: 422 }
        )
      }

      // Extract subject line if present (e.g. "Subject: ...")
      let subject = `Payment Reminder for ${customer.name}`
      let emailBody = content
      const subjectMatch = content.match(/^Subject:\s*(.+)$/m)
      if (subjectMatch && subjectMatch[1]) {
        subject = subjectMatch[1].trim()
        emailBody = content.replace(/^Subject:\s*.+$\n?/m, '').trim()
      }

      const result = await sendEmail({
        to: customer.email,
        subject,
        body: emailBody
      })
      providerId = result.providerId
    }

    // 3. Persist the outgoing message to the DB
    const message = await user.db.message.create({
      data: {
        customerId,
        direction: 'OUTGOING',
        type,
        content,
        timestamp: new Date(),
        ...(whatsappId ? { whatsappId } : {})
      }
    })

    logAction(user.companyId, user.id, 'message.send', 'message', message.id, {
      customerId,
      type
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('[CUSTOMER_SEND_MESSAGE]', error)
    // Surface WhatsApp API errors clearly rather than swallowing them
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
