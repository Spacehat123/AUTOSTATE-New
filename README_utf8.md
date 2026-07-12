# AUTOSTATE-New



\# Autostate



\*\*An AI Collection Manager — "GitHub Copilot for Accounts Receivable."\*\*



Not an accounting system. Autostate tells you \*what to do next\* to get paid, not just what's overdue.



\---



\## The problem



Small business owners know money is overdue. What they don't have is a clear answer to "who do I chase today, what do I say, and did they actually keep their promise to pay?"



\*\*Current tools\*\* (Tally, QuickBooks, spreadsheets) are passive ledgers — they show \*what's\* overdue and stop there. The owner has to manually decide who to call, write every follow-up message by hand, and remember which customers promised to pay and when. That's slow, inconsistent, and it's why money sits unpaid longer than it should.



\*\*Autostate\*\* auto-prioritizes overdue customers, drafts and sends personalized WhatsApp collection messages, and tracks promises-to-pay automatically — so the owner works down a ranked task list instead of deciding what to do from scratch every day.



\---



\## Status



🚧 Pre-MVP — in active development, following \[`roadmap.md`](./roadmap.md).



\---



\## Tech Stack



| Layer | Technology |

|---|---|

| Frontend | Next.js 16.2 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui |

| Backend | Next.js API Routes |

| Database | PostgreSQL + Prisma ORM |

| Authentication | Clerk |

| Storage | Supabase Storage |

| Background Jobs | Inngest |

| AI | Vercel AI SDK + AI Gateway — model-agnostic, provider set via env var (`anthropic/claude-haiku-4-5`, `openai/gpt-5-mini`, `google/gemini-3.5-flash`, etc.) |

| Messaging | Meta WhatsApp Cloud API |

| Hosting | Vercel (frontend + API), Railway (PostgreSQL), Supabase (storage) |



Built with \*\*\[Google Antigravity CLI](https://antigravity.google/download)\*\* (`agy`) as the AI coding agent, following the task-by-task build order in `roadmap.md`.



\---



\## Core Features (MVP)



\- \*\*Dashboard\*\* — today's prioritized task list, at-a-glance collections health

\- \*\*Customers\*\* — profiles with risk scores, communication timeline, notes

\- \*\*Invoices\*\* — track status (pending/partial/paid), outstanding amounts

\- \*\*Tasks\*\* — auto-generated, priority-ranked actions (follow up, escalate, call)

\- \*\*Messages \& WhatsApp\*\* — two-way WhatsApp integration, AI-drafted collection messages

\- \*\*AI features\*\* — priority scoring, task generation, reply parsing, message generation, relationship summaries

\- \*\*Reports\*\* — collections overview

\- \*\*Data import\*\* — bring in existing customer/invoice data



Out of scope for MVP (see Phase 19 of the roadmap): charts, email integration, multi-language messages, ML-based prioritization, mobile app, RBAC, audit log, bulk actions, customer payment portal.



\---



\## Getting Started



This project is built by directing an AI coding agent through the roadmap, not by hand-writing code. If you're new to this workflow, read the \*\*"Start Here"\*\* section at the top of `roadmap.md` first — it explains the setup and how to work through each task.



\*\*Quick version:\*\*



1\. Install \[Antigravity CLI](https://antigravity.google/download) and sign in with a Google account.

2\. Clone this repo and open it in a terminal.

3\. Run `agy` and work through `roadmap.md` phase by phase, task by task.

4\. Copy `apps/web/.env.example` → `apps/web/.env.local` and fill in real keys as each phase requires them (Clerk, database, AI Gateway, WhatsApp, Supabase, Inngest).



```bash

git clone https://github.com/Spacehat123/AUTOSTATE-New

cd Autostate-New

agy

```



\---



\## Project Structure



```

autostate/

├── apps/

│   └── web/            # Next.js app (frontend + API routes)

├── packages/

│   ├── ui/              # Shared UI components

│   ├── ai/               # Model-agnostic AI service package

│   ├── shared/          # Shared types/utilities

│   └── database/        # Prisma schema + client

├── services/

│   ├── whatsapp/         # WhatsApp Cloud API integration

│   ├── notifications/

│   └── importer/         # Data import processing

├── workers/

│   ├── reply-parser/

│   ├── scheduler/

│   └── reminders/

└── roadmap.md            # The full build plan — start here

```



\---



\## Environment Variables



See `apps/web/.env.example` for the full list. Never commit `.env.local`.



Key groups: Clerk (auth), database, AI Gateway (model-agnostic AI), WhatsApp Cloud API, Supabase (storage), Inngest (background jobs), Sentry (error monitoring, optional).



\---



\## Deployment



Production deployment steps (Vercel, Railway, Supabase, webhook configuration) are documented in `DEPLOYMENT.md`, generated as part of Phase 18 of the roadmap.



\---



\## License


Private / unlicensed
