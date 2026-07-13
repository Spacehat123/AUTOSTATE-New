import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@autostate/database'
import { inngest } from '@/lib/inngest'

export const dynamic = 'force-dynamic'

// ─────────────────────────────────────────────────────────────────────────────
// GET  /api/webhooks/whatsapp
// Meta calls this once when you register the webhook URL in the developer
// dashboard. It passes three query params; we verify the token and echo back
// the challenge string to prove we own the endpoint.
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN

  if (mode === 'subscribe' && token === expectedToken && challenge) {
    console.log('[WHATSAPP_WEBHOOK] Verification successful')
    return new NextResponse(challenge, { status: 200 })
  }

  console.warn('[WHATSAPP_WEBHOOK] Verification failed — bad token or mode')
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/webhooks/whatsapp
// Meta pushes every incoming message here. We must always return 200 quickly
// or Meta will keep retrying. Heavy processing is deferred to Inngest workers.
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  // Always respond 200 immediately — Meta drops the webhook if we're slow
  const respond = () => NextResponse.json({ status: 'ok' }, { status: 200 })

  try {
    const body = await request.json()

    // Meta wraps everything in a nested structure:
    // body.entry[].changes[].value.messages[]
    const entry = body?.entry?.[0]
    const change = entry?.changes?.[0]
    const value = change?.value

    // Ignore status updates (delivered, read receipts, etc.)
    if (!value?.messages || value.messages.length === 0) {
      return respond()
    }

    const msg = value.messages[0]

    // We only handle plain text messages for now
    if (msg?.type !== 'text') {
      return respond()
    }

    const from: string = msg.from            // e.g. "919876543210"
    const whatsappId: string = msg.id        // Meta's unique message ID
    const text: string = msg.text?.body ?? ''
    const timestamp = new Date(Number(msg.timestamp) * 1000) // Unix → JS Date

    // Normalise the phone to E.164 style for DB look-up (add + prefix)
    const normalizedPhone = from.startsWith('+') ? from : `+${from}`

    // Find matching customer by phone number
    const customer = await prisma.customer.findFirst({
      where: { phone: normalizedPhone }
    })

    if (!customer) {
      console.warn(`[WHATSAPP_WEBHOOK] No customer found for phone ${normalizedPhone}`)
      return respond()
    }

    // Persist the incoming message
    const message = await prisma.message.create({
      data: {
        customerId: customer.id,
        direction: 'INCOMING',
        type: 'WHATSAPP',
        content: text,
        timestamp,
        whatsappId
      }
    })

    // Fire an Inngest event so the AI reply-parser worker can pick it up
    await inngest.send({
      name: 'whatsapp/message.received',
      data: { messageId: message.id, customerId: customer.id }
    })

    console.log(`[WHATSAPP_WEBHOOK] Stored message ${message.id} from ${normalizedPhone}`)
    return respond()
  } catch (error) {
    // Log but still return 200 so Meta doesn't retry and flood us
    console.error('[WHATSAPP_WEBHOOK] Error processing payload:', error)
    return respond()
  }
}
