import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@autostate/database'
import { inngest } from '@/lib/inngest'
import { logger, ratelimit, decrypt } from '@autostate/shared'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

// ─────────────────────────────────────────────────────────────────────────────
// GET  /api/webhooks/whatsapp/[integrationId]
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ integrationId: string }> }
) {
  const { integrationId } = await params
  const { searchParams } = new URL(request.url)

  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const integration = await prisma.companyIntegration.findUnique({
    where: { id: integrationId }
  })

  if (!integration || integration.type !== 'WHATSAPP') {
    logger.warn('WhatsApp webhook verification failed — invalid integrationId')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const config = integration.config as any
  let expectedToken = ''
  try {
    expectedToken = config.verifyToken ? decrypt(config.verifyToken) : ''
  } catch (e) {
    logger.warn('Failed to decrypt verifyToken during webhook verification')
  }

  // Fallback to global ENV if not found (Phase 1 migration)
  if (!expectedToken) {
    expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || ''
  }

  if (mode === 'subscribe' && token === expectedToken && challenge) {
    logger.info('WhatsApp webhook verification successful')
    return new NextResponse(challenge, { status: 200 })
  }

  logger.warn('WhatsApp webhook verification failed — bad token or mode')
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/webhooks/whatsapp/[integrationId]
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

    if (!integration || integration.type !== 'WHATSAPP') {
      return respond() // Drop silently
    }

    const rawBody = await request.text()
    
    const signatureHeader = request.headers.get('x-hub-signature-256')
    const secret = process.env.WHATSAPP_APP_SECRET
    
    if (secret) {
      if (!signatureHeader) {
        logger.warn('WhatsApp webhook missing signature header')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      
      const signature = signatureHeader.startsWith('sha256=') 
        ? signatureHeader.slice(7) 
        : signatureHeader
      
      const expectedSignature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
      
      const sigBuf = Buffer.from(signature)
      const expectedBuf = Buffer.from(expectedSignature)
      
      if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
        logger.warn('WhatsApp webhook signature verification failed')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const body = JSON.parse(rawBody)
    const headers = Object.fromEntries(request.headers.entries())

    const ip = headers['x-forwarded-for'] ?? 'unknown'
    const { success, limit, reset, remaining } = await ratelimit.webhook.limit(`wa_${ip}`)
    
    if (!success) {
      logger.warn({ ip, limit, reset, remaining }, 'Rate limit exceeded for WhatsApp webhook')
      return respond()
    }

    const inboxEvent = await prisma.inboxEvent.create({
      data: {
        provider: 'WHATSAPP',
        companyId: integration.companyId,
        payload: body,
        headers: headers
      }
    })

    await inngest.send({
      name: 'inbox.whatsapp.received',
      data: { inboxEventId: inboxEvent.id, companyId: integration.companyId }
    })

    await prisma.inboxEvent.update({
      where: { id: inboxEvent.id },
      data: { status: 'QUEUED' }
    })

    return respond()
  } catch (error) {
    logger.error({ error }, 'Error processing WhatsApp payload')
    return respond()
  }
}
