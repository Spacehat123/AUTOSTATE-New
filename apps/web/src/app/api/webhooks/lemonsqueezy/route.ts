import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@autostate/database'
import { logger } from '@autostate/shared'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET
  if (!secret) {
    logger.error('LEMON_SQUEEZY_WEBHOOK_SECRET is not set')
    return new Response('Webhook secret missing', { status: 500 })
  }

  const signature = req.headers.get('x-signature')
  if (!signature) {
    return new Response('Missing signature', { status: 400 })
  }

  // Read raw body for signature verification
  const rawBody = await req.text()

  const hmac = crypto.createHmac('sha256', secret)
  const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8')
  const signatureBuffer = Buffer.from(signature, 'utf8')

  if (digest.length !== signatureBuffer.length || !crypto.timingSafeEqual(digest, signatureBuffer)) {
    logger.warn('Invalid signature for Lemon Squeezy webhook')
    return new Response('Invalid signature', { status: 400 })
  }

  let body
  try {
    body = JSON.parse(rawBody)
  } catch (error) {
    return new Response('Invalid JSON', { status: 400 })
  }

  const { meta, data } = body
  const eventName = meta.event_name
  const customData = meta.custom_data || {}
  const companyId = customData.company_id

  logger.info({ eventName, companyId }, 'Received Lemon Squeezy webhook')

  try {
    if (eventName.startsWith('subscription_')) {
      const attributes = data.attributes
      const lemonSqueezyCustomerId = attributes.customer_id.toString()
      const lemonSqueezySubscriptionId = data.id.toString()
      const statusStr = attributes.status.toUpperCase() // e.g. 'ACTIVE', 'PAST_DUE'
      const endsAt = attributes.ends_at ? new Date(attributes.ends_at) : null
      const plan = attributes.product_name

      let mappedStatus: any = 'TRIALING'
      if (['ACTIVE', 'ON_TRIAL'].includes(statusStr)) mappedStatus = 'ACTIVE'
      else if (['PAST_DUE', 'UNPAID'].includes(statusStr)) mappedStatus = 'PAST_DUE'
      else if (['CANCELLED', 'EXPIRED'].includes(statusStr)) mappedStatus = 'CANCELED'

      if (companyId) {
        await prisma.subscription.upsert({
          where: { companyId },
          update: {
            provider: 'LEMON_SQUEEZY',
            providerCustomerId: lemonSqueezyCustomerId,
            providerSubscriptionId: lemonSqueezySubscriptionId,
            plan,
            status: mappedStatus,
            currentPeriodEnd: endsAt,
          },
          create: {
            companyId,
            provider: 'LEMON_SQUEEZY',
            providerCustomerId: lemonSqueezyCustomerId,
            providerSubscriptionId: lemonSqueezySubscriptionId,
            plan,
            status: mappedStatus,
            currentPeriodEnd: endsAt,
          },
        })
        logger.info({ companyId, mappedStatus }, 'Updated subscription from webhook')
      } else {
        logger.warn('Received subscription event without company_id in custom_data')
      }
    }

    return new Response('OK', { status: 200 })
  } catch (error) {
    logger.error({ error, eventName }, 'Failed to process Lemon Squeezy webhook')
    return new Response('Webhook processing failed', { status: 500 })
  }
}
