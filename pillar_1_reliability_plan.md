# Implementation Plan: Pillar 1 — Reliability

## Goal Description
The objective is to establish enterprise-grade reliability for AutoState's external integrations. This plan enforces absolute durability, atomic processing claims, safe retries, and strict transaction boundaries, ensuring that payloads are never dropped and never processed twice, regardless of network or worker failures.

## User Review Required
> [!IMPORTANT]
> - `providerEventId` extraction is deferred to the worker to ensure the webhook route does absolutely no parsing.
> - The `updateMany` atomic claim guarantees that two concurrent workers cannot process the same event.
> - The Prisma `$transaction` guarantees that the `Message` and the `PROCESSED` state are committed together.

## Proposed Changes

---

### `@autostate/database` (Prisma Schema)
The `InboxEvent` schema is enhanced with strong enums, metadata fields, and versioning.

#### [MODIFY] `packages/database/prisma/schema.prisma`
```prisma
// ─────────────────────────────────────────────────────────────────────────────
// Inbox Events (Durability & Idempotency)
// ─────────────────────────────────────────────────────────────────────────────
model InboxEvent {
  id              String           @id @default(cuid())
  provider        InboxProvider
  providerEventId String?          // Extracted post-parsing (e.g. Meta message ID)
  companyId       String?          // Tenant awareness for debugging
  payload         Json             // Raw JSON payload
  headers         Json?            // Useful for debugging webhook signatures
  signature       String?
  schemaVersion   Int              @default(1)
  
  status          InboxEventStatus @default(RECEIVED)
  attempts        Int              @default(0)
  lastError       String?          @db.Text
  
  processedAt     DateTime?
  receivedAt      DateTime         @default(now())
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
}

enum InboxProvider {
  WHATSAPP
  STRIPE
  GMAIL
  OUTLOOK
  SLACK
  SHOPIFY
}

enum InboxEventStatus {
  RECEIVED
  QUEUED
  PROCESSING
  PROCESSED
  FAILED
  FAILED_PERMANENT // Poison messages that hit retry ceiling
  IGNORED
}
```

---

### `apps/web` (Webhook Endpoint)
The endpoint remains a completely "dumb" pipe. It captures the raw payload and headers without deriving any IDs, pushes to Inngest, and marks as `QUEUED`.

#### [MODIFY] `apps/web/src/app/api/webhooks/whatsapp/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@autostate/database'
import { inngest } from '@/lib/inngest'

export async function POST(request: NextRequest) {
  const respond = () => NextResponse.json({ status: 'ok' }, { status: 200 })

  try {
    const body = await request.json()
    const headers = Object.fromEntries(request.headers.entries())

    // 1. Durably store the exact raw payload. No parsing happens here.
    const inboxEvent = await prisma.inboxEvent.create({
      data: {
        provider: 'WHATSAPP',
        payload: body,
        headers: headers
      }
    })

    // 2. Dispatch to the async queue.
    await inngest.send({
      name: 'inbox.whatsapp.received',
      data: { inboxEventId: inboxEvent.id }
    })

    // 3. Mark as QUEUED. 
    await prisma.inboxEvent.update({
      where: { id: inboxEvent.id },
      data: { status: 'QUEUED' }
    })

    return respond()
  } catch (error) {
    console.error('[WHATSAPP_WEBHOOK] Failed to ingest:', error)
    return respond()
  }
}
```

---

### `apps/web` (Inngest Worker & Cron Poller)
The worker implements an atomic claim to prevent processing races, extracts the specific `providerEventId` safely, and wraps the final output in a strict `$transaction`.

#### [NEW] `apps/web/src/inngest/functions/inbox.ts`
```typescript
import { inngest } from '../client'
import { prisma } from '@autostate/database'
import { Prisma } from '@prisma/client'

const MAX_ATTEMPTS = 10;

export const processWhatsappInbox = inngest.createFunction(
  { id: 'process-whatsapp-inbox' },
  { event: 'inbox.whatsapp.received' },
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
      const customer = await prisma.customer.findFirst({ where: { phone: msg.phone } })
      if (!customer) throw new Error('Customer not found')

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
      } catch (error) {
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
      await step.sendEvent('trigger-ai', {
        name: 'message.analyze',
        data: { messageId: processResult.messageId, customerId: processResult.customerId }
      })
    }

    return processResult
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// SAFETY NET: Sweep stuck events (RECEIVED, QUEUED, stale PROCESSING)
// ─────────────────────────────────────────────────────────────────────────────
export const recoverStuckInboxEvents = inngest.createFunction(
  { id: 'recover-stuck-inbox-events' },
  { cron: '*/5 * * * *' }, // Runs every 5 minutes
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
        }
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
```

## Verification Plan

### Automated Tests
1. **Atomic Claim Test**: Execute 5 concurrent `processWhatsappInbox` runs passing the exact same `inboxEventId`. Ensure that the `updateMany` claim succeeds for exactly 1 worker and the other 4 return `claimed_or_poisoned` instantly.
2. **Crash Recovery Test**: Simulate a worker crash before the `$transaction`. The database state will show `PROCESSING`. Fast-forward 10 minutes, trigger the cron poller, and verify the event is safely re-enqueued and successfully claimed and processed.
