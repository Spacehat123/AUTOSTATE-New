import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { prisma } from '@autostate/database'
import { logger, ratelimit } from '@autostate/shared'
import { removeUserAndArchiveCompany } from '@/lib/services/users'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Rate Limiting
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  const { success, limit, reset, remaining } = await ratelimit.webhook.limit(`clerk_${ip}`)
  
  if (!success) {
    logger.warn({ ip, limit, reset, remaining }, 'Rate limit exceeded for Clerk webhook')
    return new Response('Too many requests', { status: 429 })
  }

  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    logger.error({ err }, 'Error verifying webhook')
    return new Response('Error occurred', {
      status: 400,
    })
  }

  // Handle the event
  const eventType = evt.type
  
  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, public_metadata } = evt.data
    
    // If the user signed up via an invitation, they will have companyId and role in their metadata
    if (public_metadata && typeof public_metadata.companyId === 'string' && typeof public_metadata.role === 'string') {
      const email = email_addresses[0]?.email_address
      if (email) {
        try {
          await prisma.user.create({
            data: {
              clerkId: id,
              email: email,
              name: `${first_name || ''} ${last_name || ''}`.trim() || null,
              companyId: public_metadata.companyId,
              role: public_metadata.role as 'OWNER' | 'ADMIN' | 'MEMBER'
            }
          })
          logger.info({ userId: id, companyId: public_metadata.companyId }, 'Invited user successfully joined company')
        } catch (error) {
          logger.error({ error, userId: id }, 'Error creating invited user in database')
        }
      }
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data
    
    if (id) {
      try {
        const user = await prisma.user.findUnique({
          where: { clerkId: id }
        })
        
        if (user) {
          await removeUserAndArchiveCompany(user)
        }
      } catch (error) {
        logger.error({ error, userId: id }, 'Error deleting user from database')
      }
    }
  }

  return new Response('', { status: 200 })
}
