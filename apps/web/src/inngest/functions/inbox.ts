import { inngest } from '../client'
import { prisma, Prisma } from '@autostate/database'

const MAX_ATTEMPTS = 10;

// Helper to safely extract WhatsApp message data from the Meta webhook payload
function extractWhatsappMessage(payload: any) {
  try {
    const entry = payload?.entry?.[0]
    const change = entry?.changes?.[0]
    const value = change?.value
    
    if (!value?.messages || value.messages.length === 0) return null
    const msg = value.messages[0]
    if (msg?.type !== 'text') return null

    return {
      id: msg.id,
      from: msg.from,
      phone: msg.from.startsWith('+') ? msg.from : `+${msg.from}`,
      text: msg.text?.body ?? '',
      timestamp: new Date(Number(msg.timestamp) * 1000)
    }
  } catch (e) {
    return null
  }
}

export const processWhatsappInbox = inngest.createFunction(
  { id: 'process-whatsapp-inbox', triggers: [{ event: 'inbox.whatsapp.received' }] },
  async ({ event, step }) => {
    const { inboxEventId } = event.data

    // 1. Atomic Claim (Solves the PROCESSING race condition)
    const claimed = await step.run('atomic-claim', async () => {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      
      const updateResult = await prisma.inboxEvent.updateMany({
        where: {
          id: inboxEventId,
          attempts: { lt: MAX_ATTEMPTS },
          OR: [
            { status: { in: ['RECEIVED', 'QUEUED'] } },
            { status: 'PROCESSING', updatedAt: { lt: tenMinutesAgo } } // Claim stale processing jobs
          ]
        },
        data: { 
          status: 'PROCESSING', 
          attempts: { increment: 1 } 
        }
      });

      if (updateResult.count === 0) {
        // If we couldn't claim it, check if it hit the retry ceiling
        const ev = await prisma.inboxEvent.findUnique({ where: { id: inboxEventId } });
        if (ev && ev.attempts >= MAX_ATTEMPTS) {
          await prisma.inboxEvent.update({ where: { id: inboxEventId }, data: { status: 'FAILED_PERMANENT' }});
        }
        return false;
      }
      return true;
    });

    if (!claimed) return { status: 'claimed_or_poisoned' };

    // 2. Fetch the safely claimed event
    const inboxEvent = await step.run('fetch', () => prisma.inboxEvent.findUniqueOrThrow({ where: { id: inboxEventId } }));

    // 3. Parse payload & Extract provider ID safely
    const msg = extractWhatsappMessage(inboxEvent.payload)
    if (!msg) {
      await step.run('mark-ignored', () => 
        prisma.inboxEvent.update({ where: { id: inboxEventId }, data: { status: 'IGNORED' } })
      )
      return { status: 'ignored' }
    }

    // Save the providerEventId now that we safely parsed it
    await step.run('store-provider-id', () => prisma.inboxEvent.update({ where: { id: inboxEventId }, data: { providerEventId: msg.id } }));

    // 4. Processing & Transaction Boundary
    const processResult = await step.run('process-message', async () => {
      if (!inboxEvent.companyId) {
        await prisma.inboxEvent.update({ where: { id: inboxEventId }, data: { status: 'FAILED', lastError: 'No companyId on inboxEvent' } })
        throw new Error('No companyId on inboxEvent')
      }

      const customer = await prisma.customer.findFirst({ 
        where: { 
          phone: msg.phone,
          companyId: inboxEvent.companyId 
        } 
      })
      if (!customer) {
          await prisma.inboxEvent.update({ where: { id: inboxEventId }, data: { status: 'FAILED', lastError: 'Customer not found' } })
          throw new Error('Customer not found')
      }

      try {
        // Strict transaction guarantees the message and processed state commit together
        const [newMessage] = await prisma.$transaction([
          prisma.message.create({
            data: {
              customerId: customer.id,
              whatsappId: msg.id, // Database source of truth for idempotency (P2002)
              type: 'WHATSAPP',
              direction: 'INCOMING',
              content: msg.text,
              timestamp: msg.timestamp
            }
          }),
          prisma.inboxEvent.update({ 
            where: { id: inboxEventId }, 
            data: { status: 'PROCESSED', processedAt: new Date(), companyId: customer.companyId } 
          })
        ])

        return { status: 'created', messageId: newMessage.id, customerId: customer.id }
      } catch (error: any) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          // Another worker won the race to insert the Message. Safe to ignore.
          await prisma.inboxEvent.update({ where: { id: inboxEventId }, data: { status: 'IGNORED', lastError: 'Duplicate P2002' } })
          return { status: 'duplicate' }
        }
        
        // Log last error for retries
        await prisma.inboxEvent.update({ where: { id: inboxEventId }, data: { lastError: error.message, status: 'FAILED' } })
        throw error
      }
    })

    // 5. Trigger downstream workflow
    if (processResult.status === 'created') {
      const createdResult = processResult as { status: 'created', messageId: string, customerId: string };
      await step.sendEvent('trigger-ai', {
        name: 'message.analyze',
        data: { messageId: createdResult.messageId, customerId: createdResult.customerId }
      })
    }

    return processResult
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// SAFETY NET: Sweep stuck events (RECEIVED, QUEUED, stale PROCESSING)
// ─────────────────────────────────────────────────────────────────────────────
export const recoverStuckInboxEvents = inngest.createFunction(
  { id: 'recover-stuck-inbox-events', triggers: [{ cron: '*/5 * * * *' }] },
  async ({ step }) => {
    await step.run('re-enqueue-stuck-events', async () => {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
      
      const stuckEvents = await prisma.inboxEvent.findMany({
        where: {
          OR: [
            { status: { in: ['RECEIVED', 'QUEUED'] }, createdAt: { lt: tenMinutesAgo } },
            { status: 'PROCESSING', updatedAt: { lt: tenMinutesAgo } }
          ],
          attempts: { lt: MAX_ATTEMPTS }
        },
        take: 100 // Process in batches to avoid overwhelming Inngest
      })

      for (const ev of stuckEvents) {
        await inngest.send({
          name: `inbox.${ev.provider.toLowerCase()}.received`,
          data: { inboxEventId: ev.id }
        })
      }
      
      return { recovered: stuckEvents.length }
    })
  }
)
