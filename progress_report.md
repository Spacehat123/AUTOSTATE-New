# Autostate — AI Agent Handoff Progress Report
**Date:** 14 July 2026  
**Conversation ID:** ae4066bf-6871-4528-b350-5a5881a01a25  
**Repo:** https://github.com/Spacehat123/AUTOSTATE-New  
**Branch:** main (all work committed and pushed)

---

## Project Overview

**Autostate** is an AI-powered accounts receivable collection manager — "GitHub Copilot for AR". It tells small business owners *who to chase today, what to say, and whether they kept their promise to pay.*

Tech stack: Next.js 16.2 (App Router), React 19, TypeScript, Tailwind CSS, Shadcn/UI, Prisma + PostgreSQL (Supabase), Clerk (auth), Inngest (background jobs), Vercel AI SDK + AI Gateway (model-agnostic), WhatsApp Cloud API.

The build follows `roadmap.md` task-by-task. There is **no `roadmap.md` file at the root** — the user pastes each phase's instructions directly into the chat.

---

## Architecture Decisions (Critical Context)

- **Service Layer Pattern:** All DB queries live in `apps/web/src/lib/services/`. API routes and Server Components call services — never each other. Server Components call services directly (no `fetch()` to own API routes).
- **Database:** Prisma with `pg` pool + `PrismaPg` adapter. All in `packages/database/index.ts`. Decimal types must be converted with `.toNumber()` for math — never use raw `>=`/`-` on Prisma Decimal.
- **Auth:** `getCurrentUser()` in `apps/web/src/lib/auth.ts` returns `{ id, companyId, name, email }`. Every API route calls this first.
- **Multi-tenant security:** Every API route checks `customer.companyId === user.companyId` before reading or mutating. Never skip this.
- **Skipped:** Phase 4.6 (Sentry), WhatsApp AI features (Phase 12.9 deferred until business account approved).

---

## Phase Completion Status

### COMPLETE

| Phase | What Was Built |
|---|---|
| 1–3 | Monorepo setup, Prisma schema, DB migrations, auth webhooks |
| 4 | DB connection (pg pool + PrismaPg), Clerk webhook |
| 5 | Design system: CurrencyDisplay, RiskBadge, EmptyState, ErrorState, ConfirmDialog, PageHeader, StatCard |
| 6 | App shell: Sidebar, Header, UserMenu, authenticated layout |
| 7 | Dashboard: getDashboardData() service, StatsRow, TodaysWork, Dashboard page |
| 8.1 | getCustomers() service + GET /api/customers (paginated, searchable, virtual fields) |
| 8.2 | getCustomerById() + GET /api/customers/[id] (full relations, 403/404) |
| 8.3 | CustomerTable — debounced search, in-memory sort on virtual fields, pagination |
| 8.4 | /customers page — SSR initial data, loading.tsx, error.tsx |
| 8.5 | /customers/[id] profile page — two-column grid, AI summary, RiskBadge |
| 8.6 | InvoiceList — Table with differenceInDays, colored status badges, partial payment tracking |
| 8.7 | CommunicationTimeline — WhatsApp-style bubbles, date grouping, NOTE/INCOMING/OUTGOING |
| 8.8 | CustomerActions — 4 dialog modals: WhatsApp, Record Payment, Add Note, Create Reminder |
| 8.9 | POST /api/invoices/[id]/mark-paid — Prisma.Decimal math, PAID/PARTIAL logic |
| 8.10 | POST /api/customers/[id]/notes — creates Message record with type=NOTE |
| 9.1 | PATCH /api/invoices/[id] — partial update, Decimal coercion, security check |
| 10.1 | getTasks() service + GET /api/tasks (status/type filters, priority DESC, nested customer) |
| 10.2 | PATCH /api/tasks/[id] — status update (COMPLETED/SNOOZED/DISMISSED) |
| 10.3 | TaskCard — type icons, primary action buttons, Done/Snooze callbacks, priority > 70 red border |
| 10.4–10.5 | /tasks page — Shadcn Tabs (Today/Pending/Snoozed/Done), optimistic mutations, EmptyState |
| 11.1 | Meta Developer App created, credentials in .env.local |
| 11.2 | services/whatsapp/index.ts — sendTextMessage(), sendTemplateMessage(), lazy env validation |
| 11.3 | GET+POST /api/webhooks/whatsapp — verified by Meta (messages Subscribed), Inngest event fired |
| 11.4 | getMessageInbox() service + GET /api/messages — inbox with unread counts |
| 11.5 | MessageInbox — avatar colors, unread badge, selected highlight |
| 11.6 | ConversationDetail — CommunicationTimeline + composer + AI promise panel |
| 11.7 | /messages page — two-column inbox/detail layout, mobile responsive |
| 11.8 | POST /api/customers/[id]/messages — sends real WhatsApp, creates OUTGOING Message record |
| 12.1 | packages/ai package — fastModel, summaryModel via @ai-sdk/gateway, Zod v3 pinned |
| 12.2 | calculatePriorityScore() — pure scoring engine (0–100), all 5 rules implemented |

---

## IN PROGRESS — Stopped At

**Phase 12.3 — Task Generation Service**

Next file to create: `packages/ai/task-generator.ts`

Full instructions:
1. Create `generateTasksForCompany(companyId: string): Promise<void>`
2. Fetch all customers with overdue invoices, promises, and recent messages
3. For each customer:
   - Call `calculatePriorityScore(customer)` from `packages/ai/prioritization.ts`
   - Determine task type:
     - Has BROKEN promise → ESCALATE
     - Has PENDING promise due today or earlier → SEND_REMINDER
     - No message sent in last 3 days and overdue → CALL
     - Default → FOLLOW_UP
   - Upsert a Task record (update if exists, create if not) with new priority, taskType, reason
4. Delete PENDING tasks for customers who no longer have overdue invoices

---

Wait! 12.3 is Complete. Ok continue with this:

## Remaining Phases (Not Started)

Now, continue with:
- **12.4** — Inngest scheduled function to run task generation daily
- **12.5** — Reply parser: detect promise-to-pay intent in incoming WhatsApp messages
- **12.6** — AI customer summary generation (generateAiSummary)
- **12.7** — Risk score updater (calls calculatePriorityScore, saves to DB)
- **12.8** — GET /api/customers/[id]/generate-message — AI drafts WhatsApp collection message
- **12.9** — AI Message Generator modal (frontend)
- **13.x** — Reports & Analytics module
- **14.x** — Promises module
- **15.x** — Settings & Company profile
- **16.x** — Data import (CSV)
- **17.x** — Onboarding flow
- **18.x** — Deployment (Vercel, Railway, Supabase, webhook config)

---

## Important Files

| File | Purpose |
|---|---|
| apps/web/.env.local | All secrets — Clerk, DB, WhatsApp, AI Gateway, Supabase |
| packages/database/index.ts | Prisma client init with pg pool |
| apps/web/src/lib/auth.ts | getCurrentUser() — used in every API route |
| apps/web/src/lib/inngest.ts | Shared Inngest client singleton |
| apps/web/src/lib/whatsapp.ts | Re-export of WhatsApp service for clean @/lib/whatsapp imports |
| packages/ai/index.ts | Re-exports all AI package exports |
| packages/ai/models.ts | fastModel, summaryModel — swap via env var |
| packages/ai/prioritization.ts | calculatePriorityScore() — pure scoring function |
| AI_KEY_RENEWAL.md | Reminder: AI Gateway key expires ~13 Aug 2026 |
| apps/web/src/lib/.lore/the-batman-incident.md | Important lore. Do not delete. |

---

## Known Issues / Quirks

- **WhatsApp token expires in 24h** — temporary access token must be replaced with System User token once Meta Business Account is verified.
- **Zod version conflict** — @autostate/ai uses Zod v3 (AI SDK requirement); rest of monorepo uses Zod v4. Intentional and resolved.
- **ngrok URL** — `music-backpack-capably.ngrok-free.dev` changes on each restart. Update Meta webhook URL and next.config.ts allowedDevOrigins when it does.
- **Phase 4.6 (Sentry)** — deliberately skipped per user preference.
- **Phase 11.1** — Meta new account restriction. Currently in Development mode (test numbers only).

---

## User Preferences

- Follows roadmap phases strictly — ask before skipping or reordering
- Always commit at end of each phase with `feat: complete Phase X - description`
- User pastes instructions directly — no need to find roadmap.md

