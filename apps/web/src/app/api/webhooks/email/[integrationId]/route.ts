import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@autostate/database'
import { inngest } from '@/lib/inngest'
import { logger, ratelimit } from '@autostate/shared'

export const dynamic = 'force-dynamic'

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/webhooks/email/[integrationId]
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(
  request: NextRequest, 
  { params }: { params: Promise<{ integrationId: string }> }
) {
  const { integrationId } = await params
  const respond = () => NextResponse.json({ status: 'ok' }, { status: 200 })

  try {
    const integration = await prisma.companyIntegration.findUnique({
      where: { id: integrationId }
    })

    if (!integration || integration.type !== 'EMAIL') {
      return respond() // Drop silently
    }

    const body = await request.json()
    const headers = Object.fromEntries(request.headers.entries())

    const ip = headers['x-forwarded-for'] ?? 'unknown'
    const { success, limit, reset, remaining } = await ratelimit.webhook.limit(`email_${ip}`)
    
    if (!success) {
      logger.warn({ ip, limit, reset, remaining }, 'Rate limit exceeded for Email webhook')
      return respond()
    }

    const inboxEvent = await prisma.inboxEvent.create({
      data: {
        provider: 'GMAIL', // Adjust if needed to generic email provider or OUTLOOK
        companyId: integration.companyId,
        payload: body,
        headers: headers
      }
    })

    await inngest.send({
      name: 'inbox.email.received',
      data: { inboxEventId: inboxEvent.id, companyId: integration.companyId }
    })

    await prisma.inboxEvent.update({
      where: { id: inboxEvent.id },
      data: { status: 'QUEUED' }
    })

    return respond()
  } catch (error) {
    logger.error({ error }, 'Error processing Email payload')
    return respond()
  }
}
