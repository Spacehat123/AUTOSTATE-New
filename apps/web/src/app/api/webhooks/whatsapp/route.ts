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
    const headers = Object.fromEntries(request.headers.entries())

    // 1. Durably store the exact raw payload first.
    // We do NO parsing, NO customer lookups, NO AI processing here.
    const inboxEvent = await prisma.inboxEvent.create({
      data: {
        provider: 'WHATSAPP',
        payload: body,
        headers: headers
      }
    })

    // 2. Dispatch to the async queue. Inngest handles retries and state.
    await inngest.send({
      name: 'inbox.whatsapp.received',
      data: { inboxEventId: inboxEvent.id }
    })

    // 3. Mark as QUEUED. If this fails, the event is still safe in RECEIVED state.
    await prisma.inboxEvent.update({
      where: { id: inboxEvent.id },
      data: { status: 'QUEUED' }
    })

    return respond()
  } catch (error) {
    // Log but still return 200 so Meta doesn't retry and flood us
    console.error('[WHATSAPP_WEBHOOK] Error processing payload:', error)
    return respond()
  }
}
