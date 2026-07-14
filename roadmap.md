# Autostate — AI Collection Manager: Complete Implementation Roadmap

> **Product Vision:** An AI Collection Manager — "GitHub Copilot for Accounts Receivable." Not an accounting system. The software tells you *what to do next*, not just what is overdue.

---

## 🧭 Start Here — Read This Before Task 1.1

You've never coded before. That's fine — this roadmap was written to be executed by an AI coding agent — **Google Antigravity CLI** (the `agy` command) — with you directing and checking the work. Here's how the roles actually split:

| | Does |
|---|---|
| **Antigravity CLI (`agy`)** | Writes every line of code, runs every terminal command, reads error messages, fixes bugs |
| **You** | Create accounts on external websites, copy/paste API keys when asked, click through their dashboards, and *look at the running app* to confirm it does what you expected |

You will almost never type code or run a terminal command yourself. You will occasionally copy a password-looking string from one website into a file, and you will spend a lot of time clicking around the actual app deciding "does this look right?"

### Step 0 — One-time setup (do this before Phase 1)

1. **Install Antigravity CLI.** Go to https://antigravity.google/download and follow the CLI install instructions for your OS (macOS, Linux, or Windows). Run `agy` in a terminal and sign in with a Google account when prompted — no API key needed. This gives you a terminal window where you type in plain English what you want done.
2. **Pick a model.** Antigravity CLI works with several models (Gemini, Claude, GPT). Once signed in, run `/model` inside `agy` to see what's available and pick one — you can switch anytime, and nothing in this roadmap locks you to a specific model.
2. **Create a free GitHub account** at https://github.com — this is where your code will live. You don't need to know git; just have the account.
4. **Install Node.js.** Tell `agy`: *"Check if Node.js is installed, and if not, help me install it."* Let it walk you through this rather than doing it yourself from a tutorial.
4. That's it. Everything else — accounts for Clerk, Vercel, Railway, Supabase, Meta, Inngest — happens later, exactly when the roadmap needs them (they're flagged below, see next section).

### How to actually work through this document

For each task (e.g. "3.4 — Create the Customer Database Table"), do this:

1. Open a terminal in your project folder and run `agy` to start Antigravity CLI.
2. Paste in the **entire task block** — objective, files, steps, everything — and add: *"Do this task. Explain what you did in plain English when you're finished, and tell me exactly how to check it worked without me reading any code."*
3. Read Antigravity's plain-English summary. If it says "run this command to check," ask it to just run the command itself and tell you what the output means.
4. If a task is marked **👤 YOU DO THIS**, that step needs you personally to visit a website (see below) — Antigravity can talk you through it, but can't click the buttons for you.
5. Check the box `[ ]` → `[x]` and move to the next task. **Don't skip ahead** — later tasks assume earlier ones are actually done, not just checked off.
6. If something breaks or Antigravity gets stuck: paste the error message back and say *"explain this like I've never coded before, and fix it."* Don't try to debug it yourself.

### Tasks that need YOU, not just Antigravity

Most of the ~180 tasks below are pure code — Antigravity handles them start to finish. But about a dozen require visiting an external company's website and creating an account or copying a key. Those are flagged **👤 YOU DO THIS** right in the task, so you'll see them as you go. Roughly, they cluster here:

- **Phase 4 (Authentication):** signing up for Clerk
- **Phase 11 (WhatsApp):** signing up for a Meta Developer account
- **Phase 18 (Deployment):** Vercel, Railway, Supabase, and re-pointing Meta/Clerk at your live site — this is the biggest cluster, since "going live" inherently means touching real infrastructure

Everywhere else, just hand the task to Antigravity.

### A few words you'll see a lot

- **Repo / repository** — the project folder, tracked by git so changes are saved with history.
- **API route** — a URL on your own server that your app's frontend (or WhatsApp, or Clerk) calls to fetch or save data.
- **Database migration** — a recorded change to the database's structure (e.g. "add a `notes` column"), so the change can be applied consistently everywhere.
- **Environment variable / env var** — a secret value (like an API key) kept out of the code itself, usually in a file called `.env.local`.
- **Webhook** — a URL you give another company (Clerk, Meta) so *they* can notify *your* app when something happens (a user signs up, a WhatsApp message arrives).
- **Deploy** — publish your app to the internet so it's not just running on your computer.
- **Monorepo** — one repository holding several related sub-projects (the web app, background workers, shared code) instead of separate repos for each.

If Antigravity uses a term you don't recognize, just ask it to define it — don't guess.

---

## How to Use This Roadmap

- Work through tasks **in order**. Each task lists its prerequisites explicitly.
- Mark tasks complete with `[x]` when done.
- Every task is atomic — complete one, commit, move to the next.
- Do not skip tasks. Even "obvious" steps are included intentionally.
- **"Acceptance Criteria" in each task is written for a developer** (e.g. "PATCH updates only provided fields, returns 403 if wrong company"). You don't need to verify these yourself — tell Antigravity to verify them and report back in plain English, or to show you the result in the browser.

---

## Tech Stack Reference

| Layer | Technology |
|---|---|
| Frontend | Next.js 16.2.0 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Next.js API Routes |
| Database | PostgreSQL + Prisma ORM |
| Authentication | Clerk |
| Storage | Supabase Storage |
| Background Jobs | Inngest |
| AI | Vercel AI SDK + AI Gateway — model-agnostic. Models are set by a plain string in `.env.local` (e.g. `anthropic/claude-haiku-4-5`, `openai/gpt-5-mini`, `google/gemini-3.5-flash`), so you can swap providers without touching code |
| Messaging | Meta WhatsApp Cloud API |
| Hosting | Vercel (frontend + API), Railway (PostgreSQL), Supabase (storage) |

> **A note on complexity, since this is your first app:** Phase 1 sets up a "monorepo" with 12 separate folders (`apps/`, `packages/`, `services/`, `workers/`). That structure is normal for a team planning to scale, but it's more moving parts than a solo first-time build strictly needs. You have two honest options:
> - **Follow the roadmap as written** (recommended if you want the practice building something that could grow later — Antigravity handles the complexity for you either way).
> - **Tell Antigravity, before Phase 1: "Build this as one single Next.js app, skip the monorepo/turborepo setup, and adapt every later phase accordingly."** This gets you to a working MVP faster with less to go wrong, at the cost of more rework if you ever need to split it into services later.
>
> Either is fine. If you're unsure, stick with the roadmap as written — it's what the rest of this document assumes.

---

## Phase Index

1. [Phase 1 — Project Setup](#phase-1--project-setup)
2. [Phase 2 — Core Architecture & Configuration](#phase-2--core-architecture--configuration)
3. [Phase 3 — Database & ORM](#phase-3--database--orm)
4. [Phase 4 — Authentication](#phase-4--authentication)
5. [Phase 5 — UI Foundation & Design System](#phase-5--ui-foundation--design-system)
6. [Phase 6 — Navigation & Layout Shell](#phase-6--navigation--layout-shell)
7. [Phase 7 — Dashboard Page](#phase-7--dashboard-page)
8. [Phase 8 — Customers Module](#phase-8--customers-module)
9. [Phase 9 — Invoices Module](#phase-9--invoices-module)
10. [Phase 10 — Tasks Module](#phase-10--tasks-module)
11. [Phase 11 — Messages & WhatsApp Integration](#phase-11--messages--whatsapp-integration)
12. [Phase 12 — AI Features](#phase-12--ai-features)
13. [Phase 13 — Reports Module](#phase-13--reports-module)
14. [Phase 14 — Settings Module](#phase-14--settings-module)
15. [Phase 15 — Background Jobs](#phase-15--background-jobs)
16. [Phase 16 — Data Import](#phase-16--data-import)
17. [Phase 17 — Testing](#phase-17--testing)
18. [Phase 18 — Deployment & DevOps](#phase-18--deployment--devops)
19. [Phase 19 — Post-MVP Improvements](#phase-19--post-mvp-improvements)

---

## Phase 1 — Project Setup

### 1.1 — Initialize the Monorepo

- **Objective:** Create the turborepo monorepo that will hold all apps, packages, services, and workers.
- **Files/Folders to create:**
  - `/` (project root)
  - `package.json` (root)
  - `turbo.json`
  - `.gitignore`
  - `.nvmrc`
  - `README.md`
- **Prerequisites:** None
- **Steps:**
  1. Run `npx create-turbo@latest autostate --package-manager pnpm` in the desired parent directory.
  2. Select "Empty" workspace template when prompted.
  3. Rename the generated folder to `autostate` if not already named.
- **Expected Outcome:** A turborepo scaffold with `pnpm-workspace.yaml` and a root `package.json`.
- **Acceptance Criteria:** Running `pnpm install` from the root succeeds with no errors. `turbo --version` prints a version number.

---

### 1.2 — Configure Root `.gitignore`

- **Objective:** Prevent build artifacts, secrets, and node_modules from being committed to git.
- **Files to create/modify:** `/.gitignore`
- **Prerequisites:** 1.1
- **Steps:**
  1. Open `/.gitignore`.
  2. Add the following entries:
     ```
     node_modules/
     .next/
     dist/
     build/
     .env
     .env.local
     .env.*.local
     .turbo/
     *.log
     .DS_Store
     coverage/
     .prisma/
     prisma/migrations/*.sql.bak
     ```
- **Expected Outcome:** Git does not track secrets or build artifacts.
- **Acceptance Criteria:** Running `git status` after `pnpm install` shows no `node_modules` or `.next` entries.

---

### 1.3 — Set Node Version

- **Objective:** Pin the Node.js version across all environments for consistency.
- **Files to create:** `/.nvmrc`
- **Prerequisites:** 1.1
- **Steps:**
  1. Create `/.nvmrc` with content: `22.14.0`
  2. Verify Node 22 is installed locally: `node --version`
- **Expected Outcome:** Anyone running `nvm use` will get Node 22.
- **Acceptance Criteria:** `node --version` outputs `v22.x.x`.

---

### 1.4 — Create the Monorepo Folder Structure

- **Objective:** Create all top-level workspace folders as defined in the MVP folder structure.
- **Folders to create:**
  - `apps/web/`
  - `apps/api/` *(reserved for future NestJS migration; leave empty with a README)*
  - `packages/ui/`
  - `packages/ai/`
  - `packages/shared/`
  - `packages/database/`
  - `services/whatsapp/`
  - `services/notifications/`
  - `services/importer/`
  - `workers/reply-parser/`
  - `workers/scheduler/`
  - `workers/reminders/`
- **Prerequisites:** 1.1
- **Steps:**
  1. Create each folder.
  2. Add a `.gitkeep` file in each empty folder so git tracks them.
  3. Add a stub `package.json` in each `packages/*` folder with a unique `name` field (e.g., `@autostate/ui`).
- **Expected Outcome:** All top-level directories exist.
- **Acceptance Criteria:** Running `ls apps packages services workers` lists all expected subdirectories.

---

### 1.5 — Configure `pnpm-workspace.yaml`

- **Objective:** Tell pnpm which directories are workspace packages.
- **Files to create/modify:** `/pnpm-workspace.yaml`
- **Prerequisites:** 1.4
- **Steps:**
  1. Open `/pnpm-workspace.yaml`.
  2. Set content:
     ```yaml
     packages:
       - 'apps/*'
       - 'packages/*'
       - 'services/*'
       - 'workers/*'
     ```
- **Expected Outcome:** pnpm recognizes all workspace packages.
- **Acceptance Criteria:** `pnpm ls -r` lists all workspace packages.

---

### 1.6 — Configure `turbo.json`

- **Objective:** Define the turborepo pipeline for build, dev, lint, and test tasks.
- **Files to create/modify:** `/turbo.json`
- **Prerequisites:** 1.5
- **Steps:**
  1. Set `turbo.json` content:
     ```json
     {
       "$schema": "https://turbo.build/schema.json",
       "pipeline": {
         "build": {
           "dependsOn": ["^build"],
           "outputs": [".next/**", "dist/**"]
         },
         "dev": {
           "cache": false,
           "persistent": true
         },
         "lint": {},
         "test": {
           "dependsOn": ["build"]
         },
         "db:generate": {
           "cache": false
         },
         "db:migrate": {
           "cache": false
         }
       }
     }
     ```
- **Expected Outcome:** `turbo run build` will build all apps in dependency order.
- **Acceptance Criteria:** `turbo run lint` completes without errors (even with empty workspaces).

---

### 1.7 — Initialize the Next.js Web App

- **Objective:** Create the Next.js 16.2.0 app inside `apps/web`.
- **Files/Folders created:** `apps/web/` (entire Next.js scaffold)
- **Prerequisites:** 1.4, 1.5
- **Steps:**
  1. Run from the repo root:
     ```bash
     cd apps/web
     npx create-next-app@16.2.0 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git
     ```
  2. Say Yes to all recommended defaults.
- **Expected Outcome:** `apps/web` contains a full Next.js App Router scaffold with TypeScript and Tailwind.
- **Acceptance Criteria:** Running `pnpm dev` inside `apps/web` starts the dev server and `http://localhost:3000` shows the Next.js welcome page.

---

### 1.8 — Add `apps/web` `package.json` Name

- **Objective:** Give the web app a monorepo-compatible package name.
- **Files to modify:** `apps/web/package.json`
- **Prerequisites:** 1.7
- **Steps:**
  1. Open `apps/web/package.json`.
  2. Set `"name": "@autostate/web"`.
- **Expected Outcome:** The web app is identifiable in the monorepo.
- **Acceptance Criteria:** `pnpm ls -r` lists `@autostate/web`.

---

### 1.9 — Add Root `dev` Script

- **Objective:** Allow running `pnpm dev` from the root to start all apps.
- **Files to modify:** `/package.json`
- **Prerequisites:** 1.7
- **Steps:**
  1. Open root `package.json`.
  2. Add:
     ```json
     "scripts": {
       "dev": "turbo run dev",
       "build": "turbo run build",
       "lint": "turbo run lint",
       "test": "turbo run test"
     }
     ```
- **Expected Outcome:** `pnpm dev` from the root starts all persistent dev servers.
- **Acceptance Criteria:** `pnpm dev` starts the Next.js dev server at `localhost:3000`.

---

## Phase 2 — Core Architecture & Configuration

### 2.1 — Configure TypeScript for `apps/web`

- **Objective:** Ensure strict TypeScript settings are enabled to catch errors early.
- **Files to modify:** `apps/web/tsconfig.json`
- **Prerequisites:** 1.7
- **Steps:**
  1. Open `apps/web/tsconfig.json`.
  2. Ensure `"strict": true` is present.
  3. Add `"noUncheckedIndexedAccess": true` under `compilerOptions`.
  4. Verify `"paths": { "@/*": ["./src/*"] }` is present.
- **Expected Outcome:** TypeScript will catch null/undefined errors and untyped imports.
- **Acceptance Criteria:** `tsc --noEmit` completes with no errors on the fresh scaffold.

---

### 2.2 — Configure ESLint

- **Objective:** Enforce code quality rules across the web app.
- **Files to modify:** `apps/web/eslint.config.mjs`
- **Prerequisites:** 1.7
- **Steps:**
  1. Open `apps/web/eslint.config.mjs` (Next.js 16 scaffolds ESLint 9 Flat Config here by default — there is no `.eslintrc.json`).
  2. Set content:
     ```js
     import { FlatCompat } from "@eslint/eslintrc";

     const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

     const eslintConfig = [
       ...compat.extends("next/core-web-vitals", "next/typescript"),
       {
         rules: {
           "no-console": "warn",
           "@typescript-eslint/no-unused-vars": "error",
           "@typescript-eslint/no-explicit-any": "warn",
         },
       },
     ];

     export default eslintConfig;
     ```
- **Expected Outcome:** ESLint will flag `any` types and unused variables.
- **Acceptance Criteria:** `pnpm lint` in `apps/web` runs without crashing.

---

### 2.3 — Configure Prettier

- **Objective:** Enforce consistent code formatting.
- **Files to create:**
  - `apps/web/.prettierrc`
  - `apps/web/.prettierignore`
- **Prerequisites:** 1.7
- **Steps:**
  1. Install Prettier: `pnpm add -D prettier --filter @autostate/web`
  2. Create `apps/web/.prettierrc`:
     ```json
     {
       "semi": false,
       "singleQuote": true,
       "tabWidth": 2,
       "trailingComma": "es5",
       "printWidth": 100
     }
     ```
  3. Create `apps/web/.prettierignore`:
     ```
     .next/
     node_modules/
     dist/
     ```
  4. Add a `"format"` script to `apps/web/package.json`: `"format": "prettier --write ."`
- **Expected Outcome:** Running `pnpm format` auto-formats all source files.
- **Acceptance Criteria:** `pnpm format` runs without errors.

---

### 2.4 — Set Up Environment Variables (Development)

👤 **YOU DO THIS ONE (with Antigravity's help)** — this is where you'll go create accounts and copy API keys.

- **Objective:** Create the environment variable files that all services will read from.
- **Files to create:**
  - `apps/web/.env.local` *(not committed)*
  - `apps/web/.env.example` *(committed — contains variable names with empty values)*
- **Prerequisites:** 1.7
- **Steps:**
  1. Create `apps/web/.env.example` with the following keys (values are empty):
     ```env
     # Clerk Authentication
     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
     CLERK_SECRET_KEY=
     NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
     NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
     NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
     NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

     # Database
     DATABASE_URL=

     # AI (Vercel AI Gateway — works with any provider's models via one key)
     AI_GATEWAY_API_KEY=
     AI_FAST_MODEL=anthropic/claude-haiku-4-5
     AI_SUMMARY_MODEL=anthropic/claude-sonnet-5

     # WhatsApp
     WHATSAPP_ACCESS_TOKEN=
     WHATSAPP_PHONE_NUMBER_ID=
     WHATSAPP_VERIFY_TOKEN=

     # Supabase Storage
     SUPABASE_URL=
     SUPABASE_ANON_KEY=
     SUPABASE_SERVICE_ROLE_KEY=

     # Inngest
     INNGEST_EVENT_KEY=
     INNGEST_SIGNING_KEY=

     # Sentry
     SENTRY_DSN=

     # App
     NEXT_PUBLIC_APP_URL=http://localhost:3000
     ```
  2. Copy `apps/web/.env.example` to `apps/web/.env.local`.
  3. Fill in real values in `.env.local` (do not commit this file).
- **Expected Outcome:** Application knows all required environment variables.
- **Acceptance Criteria:** `.env.example` is committed. `.env.local` is gitignored. All variable names are documented.

---

### 2.5 — Install Core Dependencies

- **Objective:** Install all major npm packages required by the web app before building features.
- **Files to modify:** `apps/web/package.json`
- **Prerequisites:** 1.7, 2.4
- **Steps:**
  1. Run from repo root:
     ```bash
     pnpm add @clerk/nextjs @prisma/client @google/generative-ai inngest axios zod date-fns clsx tailwind-merge lucide-react recharts --filter @autostate/web
     ```
  2. Run:
     ```bash
     pnpm add -D prisma @types/node --filter @autostate/web
     ```
- **Expected Outcome:** All packages are installed in `apps/web/node_modules` (or the pnpm store).
- **Acceptance Criteria:** `apps/web/package.json` lists all packages. `pnpm install` from root succeeds.

---

### 2.6 — Install and Configure shadcn/ui

- **Objective:** Set up the shadcn/ui component library that provides accessible, customizable UI primitives.
- **Files created/modified:**
  - `apps/web/components.json`
  - `apps/web/src/lib/utils.ts`
  - `apps/web/src/components/ui/` *(directory created by shadcn)*
- **Prerequisites:** 2.5
- **Steps:**
  1. Run inside `apps/web` (the package is now `shadcn`, not `shadcn-ui` — the old package is deprecated):
     ```bash
     npx shadcn@latest init
     ```
  2. Select: TypeScript=Yes, Style=Default, Base Color=Slate, CSS variables=Yes, components alias=`@/components`, utils alias=`@/lib/utils`, React Server Components=Yes. On Tailwind v4 there is no `tailwind.config.ts` prompt — the CLI writes tokens directly into `apps/web/src/app/globals.css` using `@theme`.
  3. Verify `apps/web/src/lib/utils.ts` was created with the `cn` helper function.
- **Expected Outcome:** shadcn/ui is initialized and ready to add components.
- **Acceptance Criteria:** `apps/web/components.json` exists. `apps/web/src/lib/utils.ts` exports a `cn` function.

---

### 2.7 — Add shadcn/ui Base Components

- **Objective:** Install the specific shadcn/ui components that will be used throughout the app.
- **Files created:** `apps/web/src/components/ui/*.tsx` (one per component)
- **Prerequisites:** 2.6
- **Steps:**
  1. Run inside `apps/web`:
     ```bash
     npx shadcn@latest add button card badge input label select textarea dialog sheet table tabs skeleton avatar dropdown-menu toast alert separator progress
     ```
  2. Confirm all component files appear in `apps/web/src/components/ui/`.
- **Expected Outcome:** All base UI primitives are available as importable React components.
- **Acceptance Criteria:** Each listed component has a corresponding `.tsx` file in `apps/web/src/components/ui/`.

---

### 2.8 — Configure Tailwind CSS

- **Objective:** Extend the default Tailwind configuration with custom design tokens for the Autostate brand.
- **Files to modify:** `apps/web/src/app/globals.css`
- **Prerequisites:** 2.6
- **Steps:**
  1. Tailwind v4 no longer uses `tailwind.config.ts` for theme tokens — configuration lives directly in CSS via the `@theme` directive. Open `apps/web/src/app/globals.css`.
  2. Add a custom color palette inside an `@theme` block:
     ```css
     @theme {
       --color-brand-50: #eff6ff;
       --color-brand-100: #dbeafe;
       --color-brand-500: #3b82f6;
       --color-brand-600: #2563eb;
       --color-brand-700: #1d4ed8;
       --color-brand-900: #1e3a8a;

       --color-surface: #0f172a;
       --color-surface-card: #1e293b;
       --color-surface-border: #334155;
     }
     ```
  3. Add the custom font family in the same `@theme` block:
     ```css
     @theme {
       --font-sans: 'Inter', sans-serif;
     }
     ```
  4. Content detection is automatic in Tailwind v4 (no `content` array needed) — confirm `@import "tailwindcss";` is present at the top of `globals.css`.
- **Expected Outcome:** Custom brand colors and fonts are available as Tailwind utility classes (e.g. `bg-brand-600`, `font-sans`).
- **Acceptance Criteria:** `pnpm build` in `apps/web` succeeds. Custom classes like `bg-brand-600` and `bg-surface` are generated in the CSS output.

---

### 2.9 — Configure Global CSS

- **Objective:** Set the global base styles, CSS variables for shadcn/ui, and import the Inter font.
- **Files to modify:** `apps/web/src/app/globals.css`
- **Prerequisites:** 2.8
- **Steps:**
  1. Open `apps/web/src/app/globals.css`.
  2. Add Google Fonts import at the top:
     ```css
     @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
     ```
  3. Ensure `@import "tailwindcss";` is present at the top (Tailwind v4 — not the old `@tailwind base/components/utilities` directives).
  4. Set CSS variables for dark mode under `:root`:
     ```css
     :root {
       --background: 222.2 84% 4.9%;
       --foreground: 210 40% 98%;
       --card: 222.2 84% 4.9%;
       --card-foreground: 210 40% 98%;
       --primary: 217.2 91.2% 59.8%;
       --primary-foreground: 222.2 47.4% 11.2%;
       --muted: 217.2 32.6% 17.5%;
       --muted-foreground: 215 20.2% 65.1%;
       --border: 217.2 32.6% 17.5%;
       --input: 217.2 32.6% 17.5%;
       --ring: 224.3 76.3% 48%;
     }
     ```
  5. Set `html { color-scheme: dark; }` to default to dark mode.
- **Expected Outcome:** The app renders in dark mode with Inter font by default.
- **Acceptance Criteria:** `localhost:3000` shows dark background with Inter font.

---

### 2.10 — Create the Root `layout.tsx`

- **Objective:** Set up the root layout with font, metadata, and Clerk provider wrapping.
- **Files to modify:** `apps/web/src/app/layout.tsx`
- **Prerequisites:** 2.9, 4.1
- **Steps:**
  1. Open `apps/web/src/app/layout.tsx`.
  2. Add `<html lang="en" className="dark">` to force dark mode.
  3. Add SEO metadata: `title: 'Autostate — AI Collection Manager'`, `description: 'AI-powered accounts receivable management'`.
  4. Wrap `{children}` with `<ClerkProvider>` (imported from `@clerk/nextjs`).
  5. Add `<Toaster />` component from shadcn/ui for global toast notifications.
- **Expected Outcome:** The entire app is wrapped in Clerk auth context and can show toast notifications.
- **Acceptance Criteria:** `localhost:3000` renders without console errors. Clerk context is available.

---

## Phase 3 — Database & ORM

### 3.1 — Set Up the `packages/database` Package

- **Objective:** Create a shared Prisma database package usable by all apps in the monorepo.
- **Files to create:**
  - `packages/database/package.json`
  - `packages/database/tsconfig.json`
  - `packages/database/index.ts`
  - `packages/database/prisma/schema.prisma`
- **Prerequisites:** 1.4, 2.5
- **Steps:**
  1. Create `packages/database/package.json`:
     ```json
     {
       "name": "@autostate/database",
       "version": "0.0.1",
       "main": "./index.ts",
       "scripts": {
         "db:generate": "prisma generate",
         "db:migrate": "prisma migrate dev",
         "db:push": "prisma db push",
         "db:studio": "prisma studio"
       },
       "dependencies": {
         "@prisma/client": "^7.0.0"
       },
       "devDependencies": {
         "prisma": "^7.0.0",
         "typescript": "^5.0.0"
       }
     }
     ```
  2. Run `pnpm add prisma @prisma/client -D --filter @autostate/database`.
  3. Run `npx prisma init --datasource-provider postgresql` inside `packages/database`. This scaffolds `prisma/schema.prisma` with a default `generator client { provider = "prisma-client-js" }` block and a `.env` with `DATABASE_URL`.
  4. Immediately update the generated `generator client` block to the Prisma 7 format, since Prisma 7 removed implicit generation into `node_modules/@prisma/client` and requires an explicit `output` path:
     ```prisma
     generator client {
       provider = "prisma-client"
       output   = "../generated/prisma"
     }
     ```
  5. Do not run `prisma generate` yet — there are no models defined until 3.2 onward. Generation happens once as part of 3.10.
- **Expected Outcome:** Prisma is initialized with a `prisma/schema.prisma` file already configured for Prisma 7's explicit client output.
- **Acceptance Criteria:** `packages/database/prisma/schema.prisma` exists with a `datasource db` block and a `generator client` block using `provider = "prisma-client"` and `output = "../generated/prisma"`.

---

### 3.2 — Create the `Company` Database Table

- **Objective:** Define the `Company` model — the top-level entity that all other data belongs to.
- **Files to modify:** `packages/database/prisma/schema.prisma`
- **Prerequisites:** 3.1
- **Steps:**
  1. Add the `Company` model to `schema.prisma`:
     ```prisma
     model Company {
       id          String   @id @default(cuid())
       name        String
       gstNumber   String?
       phone       String?
       email       String?
       address     String?
       createdAt   DateTime @default(now())
       updatedAt   DateTime @updatedAt

       users       User[]
       customers   Customer[]
     }
     ```
- **Expected Outcome:** The schema defines a `Company` table.
- **Acceptance Criteria:** `npx prisma validate` passes with no errors.

---

### 3.3 — Create the `User` Database Table

- **Objective:** Define the `User` model linked to a Clerk user ID and a Company.
- **Files to modify:** `packages/database/prisma/schema.prisma`
- **Prerequisites:** 3.2
- **Steps:**
  1. Add the `User` model:
     ```prisma
     model User {
       id        String   @id @default(cuid())
       clerkId   String   @unique
       email     String   @unique
       name      String?
       role      UserRole @default(MEMBER)
       companyId String
       company   Company  @relation(fields: [companyId], references: [id])
       createdAt DateTime @default(now())
       updatedAt DateTime @updatedAt

       tasks     Task[]
     }

     enum UserRole {
       OWNER
       ADMIN
       MEMBER
     }
     ```
- **Expected Outcome:** The `User` table is linked to `Company` via a foreign key.
- **Acceptance Criteria:** `npx prisma validate` passes. Relation between `User` and `Company` is defined.

---

### 3.4 — Create the `Customer` Database Table

- **Objective:** Define the `Customer` model — the entity representing each debtor/client.
- **Files to modify:** `packages/database/prisma/schema.prisma`
- **Prerequisites:** 3.3
- **Steps:**
  1. Add the `Customer` model:
     ```prisma
     model Customer {
       id          String   @id @default(cuid())
       name        String
       phone       String?
       email       String?
       gstNumber   String?
       industry    String?
       riskScore   Int      @default(0)
       aiSummary   String?  @db.Text
       aiSummaryUpdatedAt DateTime?
       companyId   String
       company     Company  @relation(fields: [companyId], references: [id])
       createdAt   DateTime @default(now())
       updatedAt   DateTime @updatedAt

       invoices    Invoice[]
       messages    Message[]
       promises    Promise[]
       tasks       Task[]
     }
     ```
- **Expected Outcome:** `Customer` is linked to `Company` and has relations to all other entities.
- **Acceptance Criteria:** `npx prisma validate` passes.

---

### 3.5 — Create the `Invoice` Database Table

- **Objective:** Define the `Invoice` model with all fields from the MVP data model.
- **Files to modify:** `packages/database/prisma/schema.prisma`
- **Prerequisites:** 3.4
- **Steps:**
  1. Add the `Invoice` model:
     ```prisma
     model Invoice {
       id                String        @id @default(cuid())
       invoiceNumber     String
       amount            Decimal       @db.Decimal(18, 2)
       issueDate         DateTime
       dueDate           DateTime
       status            InvoiceStatus @default(PENDING)
       paidDate          DateTime?
       outstandingAmount Decimal       @db.Decimal(18, 2)
       customerId        String
       customer          Customer      @relation(fields: [customerId], references: [id])
       createdAt         DateTime      @default(now())
       updatedAt         DateTime      @updatedAt

       @@unique([customerId, invoiceNumber])
     }

     enum InvoiceStatus {
       PENDING
       OVERDUE
       PARTIAL
       PAID
       DISPUTED
     }
     ```
- **Expected Outcome:** Invoice table defined with status enum and customer relation.
- **Acceptance Criteria:** `npx prisma validate` passes. `@@unique` constraint exists on `[customerId, invoiceNumber]`.

---

### 3.6 — Create the `Message` Database Table

- **Objective:** Define the `Message` model for storing WhatsApp and email messages in both directions.
- **Files to modify:** `packages/database/prisma/schema.prisma`
- **Prerequisites:** 3.4
- **Steps:**
  1. Add the `Message` model:
     ```prisma
     model Message {
       id          String           @id @default(cuid())
       customerId  String
       customer    Customer         @relation(fields: [customerId], references: [id])
       type        MessageType
       direction   MessageDirection
       content     String           @db.Text
       aiSummary   String?          @db.Text
       whatsappId  String?          @unique
       timestamp   DateTime         @default(now())
       createdAt   DateTime         @default(now())

       promises    Promise[]
     }

     enum MessageType {
       WHATSAPP
       EMAIL
       NOTE
     }

     enum MessageDirection {
       INCOMING
       OUTGOING
     }
     ```
- **Expected Outcome:** Messages can be stored with their source type and direction.
- **Acceptance Criteria:** `npx prisma validate` passes.

---

### 3.7 — Create the `Promise` Database Table

- **Objective:** Define the `Promise` model — records when a customer promises to pay by a certain date.
- **Files to modify:** `packages/database/prisma/schema.prisma`
- **Prerequisites:** 3.6
- **Steps:**
  1. Add the `Promise` model:
     ```prisma
     model Promise {
       id            String        @id @default(cuid())
       customerId    String
       customer      Customer      @relation(fields: [customerId], references: [id])
       messageId     String?
       message       Message?      @relation(fields: [messageId], references: [id])
       expectedDate  DateTime
       amount        Decimal?      @db.Decimal(18, 2)
       status        PromiseStatus @default(PENDING)
       aiConfidence  Float?
       createdByAI   Boolean       @default(false)
       createdAt     DateTime      @default(now())
       updatedAt     DateTime      @updatedAt
     }

     enum PromiseStatus {
       PENDING
       KEPT
       BROKEN
       RESCHEDULED
     }
     ```
- **Expected Outcome:** Promises are tracked with AI confidence scores.
- **Acceptance Criteria:** `npx prisma validate` passes. `Promise` has optional link to `Message`.

---

### 3.8 — Create the `Task` Database Table

- **Objective:** Define the `Task` model — AI-generated action items for the collection team.
- **Files to modify:** `packages/database/prisma/schema.prisma`
- **Prerequisites:** 3.4
- **Steps:**
  1. Add the `Task` model:
     ```prisma
     model Task {
       id         String     @id @default(cuid())
       customerId String
       customer   Customer   @relation(fields: [customerId], references: [id])
       assignedTo String?
       user       User?      @relation(fields: [assignedTo], references: [id])
       taskType   TaskType
       priority   Int        @default(50)
       reason     String
       dueDate    DateTime?
       status     TaskStatus @default(PENDING)
       createdAt  DateTime   @default(now())
       updatedAt  DateTime   @updatedAt
     }

     enum TaskType {
       CALL
       SEND_REMINDER
       ESCALATE
       FOLLOW_UP
       RECORD_PAYMENT
     }

     enum TaskStatus {
       PENDING
       IN_PROGRESS
       DONE
       SNOOZED
       DISMISSED
     }
     ```
- **Expected Outcome:** Tasks have type, priority score, reason, and status.
- **Acceptance Criteria:** `npx prisma validate` passes.

---

### 3.9 — Create the `ImportJob` Database Table

- **Objective:** Track Excel/CSV import jobs so users can see the status of their data uploads.
- **Files to modify:** `packages/database/prisma/schema.prisma`
- **Prerequisites:** 3.3
- **Steps:**
  1. Add the `ImportJob` model:
     ```prisma
     model ImportJob {
       id            String          @id @default(cuid())
       companyId     String
       fileName      String
       status        ImportJobStatus @default(PENDING)
       totalRows     Int?
       processedRows Int?
       errorLog      String?         @db.Text
       createdAt     DateTime        @default(now())
       updatedAt     DateTime        @updatedAt
     }

     enum ImportJobStatus {
       PENDING
       PROCESSING
       DONE
       FAILED
     }
     ```
- **Expected Outcome:** Import jobs are trackable by the user.
- **Acceptance Criteria:** `npx prisma validate` passes.

---

### 3.10 — Run the First Database Migration

- **Objective:** Apply all schema models to the actual PostgreSQL database.
- **Prerequisites:** 3.2–3.9, a running PostgreSQL database with credentials in `.env.local`
- **Steps:**
  1. Set `DATABASE_URL` in `packages/database/.env` (or rely on the root `.env`).
  2. Run from inside `packages/database`:
     ```bash
     npx prisma migrate dev --name init
     ```
  3. Verify migration succeeds.
- **Expected Outcome:** All tables are created in the PostgreSQL database.
- **Acceptance Criteria:** `npx prisma studio` opens and shows all tables: `Company`, `User`, `Customer`, `Invoice`, `Message`, `Promise`, `Task`, `ImportJob`.

---

### 3.11 — Create the Prisma Client Singleton

- **Objective:** Create a singleton Prisma client to prevent multiple database connections in development.
- **Files to create:** `packages/database/index.ts`
- **Prerequisites:** 3.10
- **Steps:**
  1. Create `packages/database/index.ts`. Note: with Prisma 7's explicit `output` path (set in 3.6), the client is imported from the generated output folder, not the `@prisma/client` package directly:
     ```ts
     import { PrismaClient } from '../generated/prisma'

     const globalForPrisma = globalThis as unknown as {
       prisma: PrismaClient | undefined
     }

     export const prisma =
       globalForPrisma.prisma ??
       new PrismaClient({
         log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
       })

     if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

     export * from '../generated/prisma'
     ```
- **Expected Outcome:** A single Prisma client instance is reused across hot reloads.
- **Acceptance Criteria:** Importing `prisma` from `@autostate/database` works without creating multiple connections.

---

### 3.12 — Add `@autostate/database` Dependency to Web App

- **Objective:** Allow the Next.js app to import and use the Prisma client.
- **Files to modify:** `apps/web/package.json`
- **Prerequisites:** 3.11
- **Steps:**
  1. Run: `pnpm add @autostate/database --filter @autostate/web --workspace`
  2. Verify the dependency appears in `apps/web/package.json`.
- **Expected Outcome:** `import { prisma } from '@autostate/database'` works in API routes.
- **Acceptance Criteria:** `pnpm install` succeeds. TypeScript can resolve `@autostate/database`.

---

### 3.13 — Create the Database Seed Script

- **Objective:** Populate the database with realistic sample data for development and demo purposes.
- **Files to create:** `packages/database/seed.ts`
- **Prerequisites:** 3.11
- **Steps:**
  1. Create `packages/database/seed.ts` with:
     - One `Company` record.
     - One `User` record (owner).
     - At least 5 `Customer` records with different risk scores.
     - At least 10 `Invoice` records spread across customers with a mix of `PENDING`, `OVERDUE`, `PAID` statuses.
     - At least 3 `Task` records (CALL, SEND_REMINDER, ESCALATE types).
     - At least 2 `Message` records (one incoming with a promise-like text).
     - At least 1 `Promise` record.
  2. Add `"db:seed": "ts-node seed.ts"` to `packages/database/package.json` scripts.
  3. Add `"prisma": { "seed": "ts-node seed.ts" }` to `packages/database/package.json`.
  4. Run: `npx prisma db seed`
- **Expected Outcome:** Database has realistic sample data.
- **Acceptance Criteria:** Prisma Studio shows all tables populated. `npx prisma db seed` completes without errors.

---

## Phase 4 — Authentication

### 4.1 — Create a Clerk Application

👤 **YOU DO THIS ONE** — sign up at a website and copy some keys back.

- **Objective:** Set up a Clerk project to handle all authentication (sign-in, sign-up, session management).
- **Prerequisites:** 2.4
- **Steps:**
  1. Go to https://clerk.com and create a new application named "Autostate".
  2. Select "Email + Password" and "Google" as sign-in methods.
  3. Copy the `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` into `apps/web/.env.local`.
- **Expected Outcome:** Clerk app is created and credentials are in `.env.local`.
- **Acceptance Criteria:** Both env vars are set and non-empty in `.env.local`.

---

### 4.2 — Install and Configure Clerk in Next.js

- **Objective:** Wrap the Next.js app with Clerk's provider and configure middleware for protected routes.
- **Files to create/modify:**
  - `apps/web/src/middleware.ts`
  - `apps/web/src/app/layout.tsx`
- **Prerequisites:** 4.1, 2.5
- **Steps:**
  1. Create `apps/web/src/middleware.ts`:
     ```ts
     import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

     const isPublicRoute = createRouteMatcher([
       '/sign-in(.*)',
       '/sign-up(.*)',
       '/api/webhooks(.*)',
     ])

     export default clerkMiddleware((auth, request) => {
       if (!isPublicRoute(request)) {
         auth().protect()
       }
     })

     export const config = {
       matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
     }
     ```
  2. Modify `apps/web/src/app/layout.tsx` to wrap children with `<ClerkProvider>`.
- **Expected Outcome:** All routes except `/sign-in`, `/sign-up`, and webhooks are protected.
- **Acceptance Criteria:** Visiting `localhost:3000/dashboard` without being logged in redirects to `/sign-in`.

---

### 4.3 — Create the Sign-In Page

- **Objective:** Build a branded sign-in page using Clerk's `<SignIn>` component.
- **Files to create:**
  - `apps/web/src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`
  - `apps/web/src/app/(auth)/layout.tsx`
- **Prerequisites:** 4.2
- **Steps:**
  1. Create the auth layout `apps/web/src/app/(auth)/layout.tsx`:
     ```tsx
     export default function AuthLayout({ children }: { children: React.ReactNode }) {
       return (
         <div className="min-h-screen flex items-center justify-center bg-surface">
           {children}
         </div>
       )
     }
     ```
  2. Create the sign-in page:
     ```tsx
     import { SignIn } from '@clerk/nextjs'
     export default function SignInPage() {
       return <SignIn />
     }
     ```
- **Expected Outcome:** `localhost:3000/sign-in` shows the Clerk sign-in form centered on a dark background.
- **Acceptance Criteria:** The sign-in form renders. Submitting with valid credentials redirects to `/dashboard`.

---

### 4.4 — Create the Sign-Up Page

- **Objective:** Build the sign-up page using Clerk's `<SignUp>` component.
- **Files to create:** `apps/web/src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`
- **Prerequisites:** 4.3
- **Steps:**
  1. Create the sign-up page:
     ```tsx
     import { SignUp } from '@clerk/nextjs'
     export default function SignUpPage() {
       return <SignUp />
     }
     ```
- **Expected Outcome:** `localhost:3000/sign-up` shows the sign-up form.
- **Acceptance Criteria:** New user sign-up succeeds and redirects to `/onboarding`.

---

### 4.5 — Create the Onboarding Page

- **Objective:** After first sign-up, collect company name and basic info, then create `Company` and `User` records in the database.
- **Files to create:**
  - `apps/web/src/app/onboarding/page.tsx`
  - `apps/web/src/app/api/onboarding/route.ts`
- **Prerequisites:** 4.4, 3.11
- **Steps:**
  1. Create `apps/web/src/app/onboarding/page.tsx` with a form collecting: Company Name, GST Number (optional), Phone.
  2. On submit, the form calls `POST /api/onboarding`.
  3. Create `apps/web/src/app/api/onboarding/route.ts`:
     - Get `userId` from Clerk using `auth()`.
     - Create a `Company` record in the database.
     - Create a `User` record linked to the company with `clerkId` set.
     - Redirect to `/dashboard`.
- **Expected Outcome:** First-time users are guided to set up their company before seeing the dashboard.
- **Acceptance Criteria:** After sign-up and onboarding, a `Company` and `User` row appear in the database. User is redirected to `/dashboard`.

---

### 4.6 — Create the Clerk Webhook Handler

👤 **PARTLY YOU** — Antigravity writes the code, but registering the webhook URL happens in the Clerk dashboard (full production version is in Phase 18).

- **Objective:** Handle Clerk webhook events (user created, deleted) to keep the database in sync.
- **Files to create:** `apps/web/src/app/api/webhooks/clerk/route.ts`
- **Prerequisites:** 4.2, 3.11
- **Steps:**
  1. Install `svix`: `pnpm add svix --filter @autostate/web`
  2. Create the webhook route that verifies the signature using `svix`.
  3. On `user.deleted` event: soft-delete the user record in the database.
  4. Configure the webhook URL in the Clerk dashboard: `https://your-domain.com/api/webhooks/clerk`.
  5. Add `CLERK_WEBHOOK_SECRET` to `.env.example` and `.env.local`.
- **Expected Outcome:** Database stays in sync when users are modified in Clerk.
- **Acceptance Criteria:** Webhook route returns `200` on valid requests. Returns `400` on invalid signatures.

---

### 4.7 — Create a `getCurrentUser` Helper

- **Objective:** Create a reusable server-side helper that returns the current authenticated user with their company from the database.
- **Files to create:** `apps/web/src/lib/auth.ts`
- **Prerequisites:** 4.5
- **Steps:**
  1. Create `apps/web/src/lib/auth.ts`:
     ```ts
     import { auth } from '@clerk/nextjs/server'
     import { prisma } from '@autostate/database'
     import { redirect } from 'next/navigation'

     export async function getCurrentUser() {
       const { userId } = auth()
       if (!userId) redirect('/sign-in')

       const user = await prisma.user.findUnique({
         where: { clerkId: userId },
         include: { company: true },
       })

       if (!user) redirect('/onboarding')
       return user
     }
     ```
- **Expected Outcome:** Any server component or API route can call `getCurrentUser()` to get the full user object.
- **Acceptance Criteria:** Function returns user with company data. Redirects to `/sign-in` if not authenticated. Redirects to `/onboarding` if no DB record exists.

---

## Phase 5 — UI Foundation & Design System

### 5.1 — Create the `LoadingSpinner` Component

- **Objective:** Create a reusable loading spinner for async operations.
- **Files to create:** `apps/web/src/components/ui/loading-spinner.tsx`
- **Prerequisites:** 2.7
- **Steps:**
  1. Create `LoadingSpinner` with a `size` prop (`'sm' | 'md' | 'lg'`).
  2. Use a CSS animated ring with `animate-spin` and brand border color.
  3. Export the component.
- **Expected Outcome:** Component renders an animated spinner.
- **Acceptance Criteria:** Component is importable and renders without errors. Three size variants work correctly.

---

### 5.2 — Create the `PageHeader` Component

- **Objective:** Create a reusable page header with a title and optional subtitle/actions slot.
- **Files to create:** `apps/web/src/components/shared/page-header.tsx`
- **Prerequisites:** 2.6
- **Steps:**
  1. Create `PageHeader` with props: `title: string`, `subtitle?: string`, `actions?: React.ReactNode`.
  2. Layout: flex row, title/subtitle on the left, actions on the right.
  3. Title uses `text-2xl font-bold text-white`.
  4. Subtitle uses `text-slate-400 mt-1`.
- **Expected Outcome:** Consistent page headers across all pages.
- **Acceptance Criteria:** Component renders correctly with all prop combinations (title only, title+subtitle, title+actions, all three).

---

### 5.3 — Create the `StatCard` Component

- **Objective:** Create the reusable stat card used on the Dashboard and Reports pages.
- **Files to create:** `apps/web/src/components/shared/stat-card.tsx`
- **Prerequisites:** 2.7
- **Steps:**
  1. Create `StatCard` with props: `title: string`, `value: string | number`, `subtitle?: string`, `icon?: React.ReactNode`, `trend?: { value: number, direction: 'up' | 'down' }`.
  2. Use the shadcn `Card` primitive as the base.
  3. Style with `bg-surface-card` background and brand accent color for the value.
  4. Show an optional trend indicator (green arrow up / red arrow down).
- **Expected Outcome:** A card that displays a metric with a label and optional icon.
- **Acceptance Criteria:** Renders correctly with all prop combinations. Trend indicator shows when `trend` prop is provided.

---

### 5.4 — Create the `EmptyState` Component

- **Objective:** Create a reusable empty state component for when lists have no data.
- **Files to create:** `apps/web/src/components/shared/empty-state.tsx`
- **Prerequisites:** 2.6
- **Steps:**
  1. Create `EmptyState` with props: `icon: React.ReactNode`, `title: string`, `description: string`, `action?: React.ReactNode`.
  2. Center content vertically and horizontally with `flex flex-col items-center justify-center`.
  3. Use muted text colors (`text-slate-400`, `text-slate-500`).
  4. Add vertical padding (`py-16`).
- **Expected Outcome:** Lists show a helpful empty state instead of nothing.
- **Acceptance Criteria:** Component renders an icon, title, description, and optional CTA button.

---

### 5.5 — Create the `ErrorState` Component

- **Objective:** Create a reusable error state component shown when data fetching fails.
- **Files to create:** `apps/web/src/components/shared/error-state.tsx`
- **Prerequisites:** 2.6
- **Steps:**
  1. Create `ErrorState` with props: `title: string`, `description: string`, `retry?: () => void`.
  2. Show a red `AlertCircle` Lucide icon.
  3. Show a "Try Again" button if `retry` is provided.
- **Expected Outcome:** Errors are communicated to users clearly with a recovery action.
- **Acceptance Criteria:** Component renders with and without a retry callback. "Try Again" button calls the `retry` function.

---

### 5.6 — Create the `RiskBadge` Component

- **Objective:** Create a color-coded badge displaying a customer's risk score (0–100).
- **Files to create:** `apps/web/src/components/shared/risk-badge.tsx`
- **Prerequisites:** 2.7
- **Steps:**
  1. Create `RiskBadge` with a `score: number` prop (0–100).
  2. Color logic:
     - 0–33: Green (`bg-green-900 text-green-300`) — "Low"
     - 34–66: Yellow (`bg-yellow-900 text-yellow-300`) — "Medium"
     - 67–100: Red (`bg-red-900 text-red-300`) — "High"
  3. Display the score number inside the badge.
- **Expected Outcome:** Risk scores are immediately legible by color.
- **Acceptance Criteria:** Score 92 renders red. Score 45 renders yellow. Score 20 renders green.

---

### 5.7 — Create the `CurrencyDisplay` Component

- **Objective:** Create a reusable component that formats numbers as Indian Rupees (₹).
- **Files to create:** `apps/web/src/components/shared/currency-display.tsx`
- **Prerequisites:** 2.6
- **Steps:**
  1. Create `CurrencyDisplay` with props: `value: number | string | Decimal`, `compact?: boolean`. This component is a formatting boundary only — accept the raw `Decimal` (or its serialized string) coming from Prisma, convert to a plain `number` right before formatting, and never do so earlier. All arithmetic (totals, sums, comparisons) must happen upstream on `Decimal` values via Prisma/`decimal.js` — never on a formatted string like `"₹52,00,000"`.
  2. Full format: `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })`.
  3. Compact format: if `value >= 100000`, show as `₹XL` (lakhs). If `value >= 10000000`, show as `₹XCr` (crores).
- **Expected Outcome:** Currency is always formatted consistently in Indian number system.
- **Acceptance Criteria:** `5200000` displays as "₹52,00,000" in full mode and "₹52L" in compact mode.

---

### 5.8 — Create the `ConfirmDialog` Component

- **Objective:** Create a reusable confirmation dialog to prevent accidental destructive actions.
- **Files to create:** `apps/web/src/components/shared/confirm-dialog.tsx`
- **Prerequisites:** 2.7
- **Steps:**
  1. Create `ConfirmDialog` wrapping shadcn's `Dialog`.
  2. Props: `title: string`, `description: string`, `onConfirm: () => void`, `onCancel: () => void`, `isOpen: boolean`, `isDestructive?: boolean`.
  3. Confirm button is red (`variant="destructive"`) when `isDestructive` is true.
- **Expected Outcome:** Risky actions always show a confirmation dialog.
- **Acceptance Criteria:** Dialog opens and closes. Confirm/cancel callbacks are called correctly.

---

## Phase 6 — Navigation & Layout Shell

### 6.1 — Create the Authenticated App Layout

- **Objective:** Create the main layout wrapper for all authenticated pages, containing the sidebar navigation.
- **Files to create:** `apps/web/src/app/(app)/layout.tsx`
- **Prerequisites:** 4.7, 6.2
- **Steps:**
  1. Create `apps/web/src/app/(app)/layout.tsx`.
  2. The layout renders a `flex` row container: fixed left sidebar + scrollable main content area.
  3. Import and render `<Sidebar />` on the left (fixed width: `w-64`).
  4. Render `{children}` in the main area (`flex-1 overflow-y-auto p-8`).
  5. Call `getCurrentUser()` at the top to ensure the user is authenticated and pass user data down.
- **Expected Outcome:** All pages inside `(app)/` have a consistent sidebar + main content layout.
- **Acceptance Criteria:** `/dashboard` renders with a sidebar on the left and content on the right. Unauthenticated users are redirected.

---

### 6.2 — Create the Sidebar Component

- **Objective:** Create the main navigation sidebar with all six sections from the MVP spec.
- **Files to create:** `apps/web/src/components/layout/sidebar.tsx`
- **Prerequisites:** 5.1, 2.7
- **Steps:**
  1. Create the `Sidebar` component as a `"use client"` component.
  2. Add the Autostate logo at the top (import from `Logo` component, task 6.3).
  3. Add a navigation list with these six links **in this exact order**:
     - **Dashboard** — icon: `LayoutDashboard` — href: `/dashboard`
     - **Customers** — icon: `Users` — href: `/customers`
     - **Tasks** — icon: `CheckSquare` — href: `/tasks`
     - **Messages** — icon: `MessageSquare` — href: `/messages`
     - **Reports** — icon: `BarChart2` — href: `/reports`
     - **Settings** — icon: `Settings` — href: `/settings` *(pinned to bottom, see 6.5)*
  4. Use `usePathname()` from `next/navigation` to detect the active route.
  5. Active link styles: `bg-brand-600/20 text-brand-400 border-r-2 border-brand-500`.
  6. Inactive link styles: `text-slate-400 hover:text-white hover:bg-surface-card`.
  7. Add user avatar + name at the bottom using Clerk's `useUser()` hook.
  8. Add a **Sign Out** button using Clerk's `<SignOutButton>` component.
- **Expected Outcome:** A fixed left sidebar with all 6 navigation items, active state, user info, and sign-out.
- **Acceptance Criteria:** All 6 nav links render. The active page's link is visually highlighted. Clicking Sign Out logs the user out.

---

### 6.3 — Create the Autostate Logo Component

- **Objective:** Add a branded logo to the top of the sidebar.
- **Files to create:** `apps/web/src/components/layout/logo.tsx`
- **Prerequisites:** 6.2
- **Steps:**
  1. Create a `Logo` component.
  2. Render a styled text logo: the word "Auto" in `text-brand-500` and "state" in `text-white`, both bold.
  3. Add a small blue square icon to the left of the text (a `div` with `bg-brand-600 rounded w-7 h-7`).
  4. Import and use `Logo` inside `Sidebar` at the very top.
- **Expected Outcome:** Logo appears at the top of the sidebar.
- **Acceptance Criteria:** Logo is visible and looks professional. Both color segments render correctly.

---

### 6.4 — Create the Mobile Navigation Header

- **Objective:** Create a mobile-only top navigation bar with a hamburger menu for small screens.
- **Files to create:** `apps/web/src/components/layout/mobile-header.tsx`
- **Prerequisites:** 6.2
- **Steps:**
  1. Create a `MobileHeader` component (`"use client"`).
  2. Render a `<header>` that is `md:hidden` (hidden on desktop).
  3. Include the `<Logo>` component and a hamburger `<Menu>` Lucide icon button.
  4. On hamburger click, open the sidebar navigation inside a shadcn `<Sheet>` (slide-in drawer from left).
  5. Inside the Sheet, render the same navigation links as the sidebar.
  6. Import and render `<MobileHeader>` at the top of `(app)/layout.tsx`.
- **Expected Outcome:** On mobile, the sidebar is accessible via a hamburger menu.
- **Acceptance Criteria:** On screens < 768px, the hamburger button appears. Clicking it opens the nav drawer.

---

### 6.5 — Pin Settings to the Bottom of the Sidebar

- **Objective:** Ensure the Settings link is clearly separated from the main 5 nav items at the bottom of the sidebar.
- **Files to modify:** `apps/web/src/components/layout/sidebar.tsx`
- **Prerequisites:** 6.2
- **Steps:**
  1. Restructure the sidebar layout: top section (`flex-1`) holds the first 5 nav links; bottom section holds Settings + user info + sign-out.
  2. Add a `<Separator>` from shadcn above the Settings link.
  3. The sign-out button is the last item, below Settings and user info.
- **Expected Outcome:** Settings link appears at the bottom of the sidebar, clearly separated from primary navigation.
- **Acceptance Criteria:** Settings is the last nav item above the user section. Separator is visible above Settings.

---

### 6.6 — Create Placeholder Pages for All Six Sections

- **Objective:** Create stub pages for all six sections so navigation works end-to-end immediately.
- **Files to create:**
  - `apps/web/src/app/(app)/dashboard/page.tsx`
  - `apps/web/src/app/(app)/customers/page.tsx`
  - `apps/web/src/app/(app)/tasks/page.tsx`
  - `apps/web/src/app/(app)/messages/page.tsx`
  - `apps/web/src/app/(app)/reports/page.tsx`
  - `apps/web/src/app/(app)/settings/page.tsx`
- **Prerequisites:** 6.1
- **Steps:**
  1. Each page returns a `<PageHeader>` with the section name:
     ```tsx
     import { PageHeader } from '@/components/shared/page-header'
     export default function DashboardPage() {
       return <PageHeader title="Dashboard" subtitle="Coming soon" />
     }
     ```
- **Expected Outcome:** All sidebar links navigate to their respective pages without 404 errors.
- **Acceptance Criteria:** Clicking each of the 6 sidebar links shows the corresponding page. Zero 404 errors.

---

## Phase 7 — Dashboard Page

### 7.1 — Create the Dashboard API Route

- **Objective:** Create a backend API endpoint that returns all data needed for the dashboard in a single request.
- **Files to create:** `apps/web/src/app/api/dashboard/route.ts`
- **Prerequisites:** 3.12, 4.7
- **Steps:**
  1. Create `GET /api/dashboard`.
  2. Call `getCurrentUser()` to get `companyId`.
  3. Execute these Prisma queries in parallel using `Promise.all()`:
     - **todaysCollections**: Sum of `Invoice.amount` where `paidDate = today` and `status = PAID`.
     - **totalOverdue**: Sum of `Invoice.outstandingAmount` where `status = OVERDUE`.
     - **customersRequiringAction**: Count of customers with at least one OVERDUE invoice.
     - **promisesDueToday**: Count of `Promise` where `expectedDate = today` and `status = PENDING`.
     - **messagesWaiting**: Count of `Message` where `direction = INCOMING` and no linked task.
     - **todaysTasks**: Top 10 `Task` records with `status = PENDING`, ordered by `priority DESC`, including nested `customer` data.
  4. Return all as a single JSON object.
- **Expected Outcome:** A single API call returns all dashboard data.
- **Acceptance Criteria:** `GET /api/dashboard` returns 200 with JSON containing all 6 keys. Response time < 2 seconds.

---

### 7.2 — Create the Dashboard Stats Row Component

- **Objective:** Build the top row of the dashboard showing 5 key metrics in stat cards.
- **Files to create:** `apps/web/src/components/dashboard/stats-row.tsx`
- **Prerequisites:** 5.3, 5.7, 7.1
- **Steps:**
  1. Create `StatsRow` component taking `data` prop (shaped like the dashboard API response).
  2. Render 5 `<StatCard>` components in a responsive grid (`grid grid-cols-2 md:grid-cols-5 gap-4`):
     - Today's Collections — icon: `TrendingUp` — value formatted with `CurrencyDisplay compact`
     - Total Overdue — icon: `AlertCircle` — value formatted with `CurrencyDisplay compact` — red accent
     - Customers Requiring Action — icon: `Users` — count
     - Promises Due Today — icon: `Calendar` — count
     - Messages Waiting — icon: `MessageSquare` — count
- **Expected Outcome:** The top of the dashboard shows 5 live metrics in stat cards.
- **Acceptance Criteria:** All 5 metrics render. Values match the API response. Cards are responsive.

---

### 7.3 — Create the "Today's Work" Task List Component

- **Objective:** Build the prioritized action list shown below the stats — the core of the dashboard.
- **Files to create:** `apps/web/src/components/dashboard/todays-work.tsx`
- **Prerequisites:** 5.7, 7.1
- **Steps:**
  1. Create `TodaysWork` component accepting `tasks` prop (array of Task objects with nested customer).
  2. Render each task as a card with:
     - A numbered indicator (①, ②, ③... using Unicode circled numbers).
     - Task type label: `CALL` → "Call", `SEND_REMINDER` → "Send Reminder", `ESCALATE` → "Escalate".
     - Customer name (bold).
     - Outstanding amount (`CurrencyDisplay compact`).
     - Days overdue (e.g., "62 days overdue").
     - Reason text in smaller muted text.
     - A single primary action button based on task type:
       - `CALL` → blue "Call" button.
       - `SEND_REMINDER` → blue "Generate Message" button.
       - `ESCALATE` → red "Notify Owner" button.
  3. Separate each task with a `<Separator>`.
  4. Show `<EmptyState>` if tasks array is empty.
- **Expected Outcome:** Today's prioritized work list is visible and actionable.
- **Acceptance Criteria:** Renders correctly with sample task data. Each task type shows the correct button. Empty state shows when no tasks.

---

### 7.4 — Build the Full Dashboard Page

- **Objective:** Assemble the complete Dashboard page using the stats row and today's work components.
- **Files to modify:** `apps/web/src/app/(app)/dashboard/page.tsx`
- **Prerequisites:** 7.2, 7.3
- **Steps:**
  1. Make the page an async server component.
  2. Fetch data by calling a shared service function directly (e.g. `const data = await getDashboardData(companyId)` from `@autostate/database` or a `lib/services/dashboard.ts` module that queries Prisma). Server Components should never `fetch()` your own API route — that adds a redundant network hop where the server calls itself. Reserve `/api/*` routes for clients that actually need HTTP (webhooks, external services, client-side components).
  3. Render `<PageHeader title="Dashboard" subtitle="Good morning, {user.name}" />`.
  4. Render `<StatsRow data={data} />`.
  5. Render a section label: "Today's Work" (`text-lg font-semibold text-white mb-4 mt-8`).
  6. Render `<TodaysWork tasks={data.todaysTasks} />`.
- **Expected Outcome:** The complete Dashboard is live and showing real data.
- **Acceptance Criteria:** Dashboard loads with real DB data. Stats show correct numbers. Today's work list shows top priority tasks.

---

### 7.5 — Create the Dashboard Loading State

- **Objective:** Show skeleton placeholders while dashboard data is loading.
- **Files to create:** `apps/web/src/app/(app)/dashboard/loading.tsx`
- **Prerequisites:** 7.4, 2.7
- **Steps:**
  1. Create `loading.tsx` that renders:
     - A row of 5 `<Skeleton>` cards (same height/width as stat cards).
     - A "Today's Work" heading skeleton.
     - 3 skeleton task cards (each `h-24`).
  2. Use shadcn's `Skeleton` component.
- **Expected Outcome:** Dashboard shows skeleton UI while loading.
- **Acceptance Criteria:** Navigating to `/dashboard` shows skeleton placeholders before data appears.

---

### 7.6 — Create the Dashboard Error State

- **Objective:** Show a user-friendly error if the dashboard data fails to load.
- **Files to create:** `apps/web/src/app/(app)/dashboard/error.tsx`
- **Prerequisites:** 7.4, 5.5
- **Steps:**
  1. Create `error.tsx` as a `"use client"` Next.js error boundary component.
  2. Render `<ErrorState title="Dashboard failed to load" description="An error occurred while fetching your data." retry={reset} />`.
  3. The `reset` prop comes from Next.js error boundary and retries the page.
- **Expected Outcome:** Dashboard shows an error state with a retry button if the API fails.
- **Acceptance Criteria:** Temporarily breaking the API route causes the error state to render with a working retry button.

---

## Phase 8 — Customers Module

### 8.1 — Create the Customers List API Route

- **Objective:** Build the API endpoint that returns a paginated, searchable list of customers.
- **Files to create:** `apps/web/src/app/api/customers/route.ts`
- **Prerequisites:** 3.12, 4.7
- **Steps:**
  1. Create `GET /api/customers`.
  2. Accept query parameters: `search` (string), `page` (number, default 1), `limit` (number, default 20), `sortBy` (field name, default `name`), `sortOrder` (`asc`/`desc`, default `asc`).
  3. Query `Customer` filtered by `companyId` and optional `name contains search`.
  4. For each customer, compute `totalOutstanding` (sum of overdue invoice amounts) and `oldestInvoiceDays`.
  5. Include `lastContact` from the most recent `Message` timestamp.
  6. Return: `{ data: Customer[], total: number, page: number, limit: number }`.
- **Expected Outcome:** Customers can be listed with filtering and pagination.
- **Acceptance Criteria:** `GET /api/customers?search=ABC&page=1&limit=10` returns the correct filtered subset.

---

### 8.2 — Create the Customer Detail API Route

- **Objective:** Build the API endpoint that returns full detail for a single customer.
- **Files to create:** `apps/web/src/app/api/customers/[id]/route.ts`
- **Prerequisites:** 3.12, 4.7
- **Steps:**
  1. Create `GET /api/customers/:id`.
  2. Fetch `Customer` by ID with all relations: `invoices` (ordered by `dueDate asc`), `messages` (ordered by `timestamp asc`), `promises`, `tasks`.
  3. Security check: verify `customer.companyId === user.companyId`. Return 403 if not.
  4. Return 404 if customer not found.
  5. Return full customer object with all nested data.
- **Expected Outcome:** Full customer profile data is available via API.
- **Acceptance Criteria:** Returns all nested data. Returns 404 for unknown ID. Returns 403 for wrong company.

---

### 8.3 — Create the Customer Table Component

- **Objective:** Build the searchable, sortable customer table for the Customers list page.
- **Files to create:** `apps/web/src/components/customers/customer-table.tsx`
- **Prerequisites:** 5.6, 5.7, 2.7
- **Steps:**
  1. Create `CustomerTable` as a `"use client"` component.
  2. Add a search `<Input>` above the table with debounced search (300ms delay).
  3. Render a `<Table>` with these columns:
     - **Customer** — customer name
     - **Outstanding** — `<CurrencyDisplay compact>` component
     - **Oldest Invoice** — "X days" (integer days since oldest overdue invoice)
     - **Risk** — `<RiskBadge score={riskScore} />`
     - **Last Contact** — relative date (e.g., "4 days ago") using `date-fns formatDistanceToNow`
     - **Action** — `<Button size="sm">View</Button>` navigating to `/customers/[id]`
  4. Add sort indicators on `Outstanding` and `Oldest Invoice` column headers (click to toggle asc/desc).
  5. Add pagination controls at the bottom: Previous / Page X of Y / Next.
- **Expected Outcome:** A fully functional customer table with search, sort, and pagination.
- **Acceptance Criteria:** All 6 columns render. Search filters. Sort works. Pagination works. "View" navigates to customer detail.

---

### 8.4 — Build the Customers List Page

- **Objective:** Assemble the full Customers page with the table.
- **Files to modify:** `apps/web/src/app/(app)/customers/page.tsx`
- **Prerequisites:** 8.1, 8.3
- **Steps:**
  1. Replace placeholder with the full customers page.
  2. Add `<PageHeader title="Customers" subtitle="Manage your accounts receivable" />`.
  3. Fetch initial customer data server-side.
  4. Render `<CustomerTable initialData={data} />`.
  5. Create `apps/web/src/app/(app)/customers/loading.tsx` with a skeleton table.
  6. Create `apps/web/src/app/(app)/customers/error.tsx` with the `<ErrorState>` component.
- **Expected Outcome:** `/customers` shows a live, interactive list of all customers.
- **Acceptance Criteria:** Page loads with real data. Search and pagination work. Loading and error states display correctly.

---

### 8.5 — Create the Customer Profile Page

- **Objective:** Build the detailed customer profile page showing invoices, AI summary, and communication timeline.
- **Files to create:** `apps/web/src/app/(app)/customers/[id]/page.tsx`
- **Prerequisites:** 8.2
- **Steps:**
  1. Create the dynamic `[id]` route page.
  2. Fetch data from the customer detail API.
  3. Render a back button: `← Customers` linking to `/customers`.
  4. Render the customer name as an `<h1>` with total outstanding below it.
  5. Create a two-column grid layout (`grid grid-cols-1 lg:grid-cols-2 gap-6`):
     - **Left column**: Invoice list (`<InvoiceList>`) and AI Summary section.
     - **Right column**: Communication timeline (`<CommunicationTimeline>`) and action buttons (`<CustomerActions>`).
  6. Create `loading.tsx` and `error.tsx` for this route.
- **Expected Outcome:** Full customer profile with all related data visible.
- **Acceptance Criteria:** Page loads all invoices, messages, promises, and AI summary. Layout matches MVP spec.

---

### 8.6 — Create the Invoice List Component

- **Objective:** Build the invoice list for display within the customer profile page.
- **Files to create:** `apps/web/src/components/customers/invoice-list.tsx`
- **Prerequisites:** 8.5, 5.7
- **Steps:**
  1. Create `InvoiceList` accepting `invoices: Invoice[]`.
  2. Render a `<Table>` with columns: Invoice Number, Amount, Due Date, Days Overdue, Status.
  3. Status badge colors:
     - PENDING → gray
     - OVERDUE → red
     - PARTIAL → yellow
     - PAID → green
     - DISPUTED → orange
  4. "Days Overdue" column: if overdue, show positive number in red; if not yet due, show "Due in X days" in green.
  5. Show an `<EmptyState>` if the invoices array is empty.
- **Expected Outcome:** Invoices are clearly listed with visual status indicators.
- **Acceptance Criteria:** Overdue invoices show in red. Paid invoices show in green. Days calculation is correct.

---

### 8.7 — Create the Communication Timeline Component

- **Objective:** Build the chronological message timeline for the customer profile page.
- **Files to create:** `apps/web/src/components/customers/communication-timeline.tsx`
- **Prerequisites:** 8.5
- **Steps:**
  1. Create `CommunicationTimeline` accepting `messages: Message[]`.
  2. Group messages by calendar date.
  3. Render a date header for each group (e.g., "15 Jun").
  4. For each message, render a bubble:
     - `INCOMING`: left-aligned, gray background, customer avatar on left.
     - `OUTGOING`: right-aligned, brand-blue background, no avatar.
     - `NOTE`: centered, italic, muted gray, with a sticky-note icon.
  5. Show message type icon (WhatsApp / Email / Note).
  6. Show relative timestamp below each bubble.
- **Expected Outcome:** Messages appear in a WhatsApp-like chronological timeline.
- **Acceptance Criteria:** Incoming messages appear on the left. Outgoing on the right. Notes are centered.

---

### 8.8 — Create the Customer Action Buttons Component

- **Objective:** Add quick action buttons to the customer profile page.
- **Files to create:** `apps/web/src/components/customers/customer-actions.tsx`
- **Prerequisites:** 8.5, 5.8
- **Steps:**
  1. Create `CustomerActions` as a `"use client"` component.
  2. Render four buttons in a row:
     - **Generate WhatsApp** — opens the AI Generate Message modal (Phase 12.9)
     - **Mark Payment Received** — opens a dialog with fields: Amount Received, Date of Payment
     - **Add Note** — opens a dialog with a `<Textarea>` for the note content
     - **Create Reminder** — opens a dialog with fields: Reminder Date, Reminder Type dropdown
  3. Each dialog uses the shadcn `<Dialog>` component.
  4. Each dialog has a submit button that calls the relevant API route.
- **Expected Outcome:** Quick actions are accessible from the customer profile.
- **Acceptance Criteria:** All 4 buttons render. Each opens the correct dialog. Submit buttons call the correct API.

---

### 8.9 — Create the "Mark Payment Received" API Route

- **Objective:** Allow users to record that a payment was received, updating the invoice status.
- **Files to create:** `apps/web/src/app/api/invoices/[id]/mark-paid/route.ts`
- **Prerequisites:** 3.12, 4.7
- **Steps:**
  1. Create `POST /api/invoices/:id/mark-paid`.
  2. Accept body: `{ paidAmount: string, paidDate: string }`. Validate with Zod (accept `paidAmount` as a numeric string so it can be parsed straight into a Prisma `Decimal`, avoiding JS floating-point on money).
  3. Convert `paidAmount` to `Decimal` (from `@prisma/client/runtime/library` or `decimal.js`) and compare with `Decimal` methods — never plain `>=`/`-` on raw numbers. Update `Invoice.status = 'PAID'`, `Invoice.paidDate`, and `Invoice.outstandingAmount = new Decimal(0)` if `paidAmount.gte(amount)`.
  4. If `paidAmount.lt(amount)`, set `status = 'PARTIAL'` and `outstandingAmount = amount.minus(paidAmount)`.
  5. Return the updated invoice.
- **Expected Outcome:** Invoice status updates correctly when payment is received.
- **Acceptance Criteria:** Full payment sets status to PAID. Partial payment sets status to PARTIAL with correct remaining amount.

---

### 8.10 — Create the "Add Note" API Route

- **Objective:** Allow users to add a text note to a customer's communication timeline.
- **Files to create:** `apps/web/src/app/api/customers/[id]/notes/route.ts`
- **Prerequisites:** 3.12, 4.7
- **Steps:**
  1. Create `POST /api/customers/:id/notes`.
  2. Accept body: `{ content: string }`. Validate with Zod (`content` must be non-empty).
  3. Create a `Message` record: `type = 'NOTE'`, `direction = 'OUTGOING'`, `content = body.content`, `timestamp = now()`.
  4. Return the created message.
- **Expected Outcome:** Notes appear in the communication timeline.
- **Acceptance Criteria:** POST creates a `Message` record with `type = 'NOTE'`. Note appears in timeline on page refresh.

---

## Phase 9 — Invoices Module

### 9.1 — Create the Invoice Update API Route

- **Objective:** Allow editing invoice details such as due date and outstanding amount.
- **Files to create:** `apps/web/src/app/api/invoices/[id]/route.ts`
- **Prerequisites:** 3.12, 4.7
- **Steps:**
  1. Create `PATCH /api/invoices/:id`.
  2. Accept optional body fields: `dueDate`, `outstandingAmount`, `status`. Validate with Zod.
  3. Security check: verify the invoice belongs to the current user's company.
  4. Update only the fields provided (partial update).
  5. Return the updated invoice.
- **Expected Outcome:** Invoice records can be updated.
- **Acceptance Criteria:** PATCH updates only provided fields. Returns 403 if wrong company. Returns 404 if not found.

---

## Phase 10 — Tasks Module

### 10.1 — Create the Tasks List API Route

- **Objective:** Build the API endpoint that returns tasks sorted by priority.
- **Files to create:** `apps/web/src/app/api/tasks/route.ts`
- **Prerequisites:** 3.12, 4.7
- **Steps:**
  1. Create `GET /api/tasks`.
  2. Accept query params: `status` (default `PENDING`), `type` (optional TaskType filter).
  3. Filter by `customer.companyId = user.companyId`.
  4. Return tasks ordered by `priority DESC`.
  5. Include nested `customer` data (name, phone, riskScore) with each task.
- **Expected Outcome:** Tasks list is filterable by status and type.
- **Acceptance Criteria:** Returns tasks in priority order. Nested customer data is present.

---

### 10.2 — Create the Task Update API Route

- **Objective:** Allow updating task status (mark done, snooze, dismiss).
- **Files to create:** `apps/web/src/app/api/tasks/[id]/route.ts`
- **Prerequisites:** 3.12, 4.7
- **Steps:**
  1. Create `PATCH /api/tasks/:id`.
  2. Accept body: `{ status: TaskStatus }`. Validate with Zod.
  3. Security check: verify task belongs to current user's company.
  4. Update and return the task.
- **Expected Outcome:** Tasks can be completed, snoozed, or dismissed.
- **Acceptance Criteria:** PATCH updates task status. Returns 404 if not found. Returns 403 if wrong company.

---

### 10.3 — Create the Task Card Component

- **Objective:** Build a single task card component for the Tasks page.
- **Files to create:** `apps/web/src/components/tasks/task-card.tsx`
- **Prerequisites:** 5.7, 2.7
- **Steps:**
  1. Create `TaskCard` as a `"use client"` component.
  2. Props: `task: Task & { customer: Customer }`, `onComplete: () => void`, `onSnooze: () => void`.
  3. Render a `<Card>` containing:
     - Task type icon + label (Phone for CALL, MessageSquare for SEND_REMINDER, AlertTriangle for ESCALATE).
     - Customer name as a link to `/customers/[id]`.
     - Outstanding amount and days overdue.
     - Reason text (muted, smaller).
     - Primary action button (type-specific, see 7.3 for button labels).
     - Secondary row: `Done` and `Snooze` buttons (smaller, ghost variant).
  4. Priority styling: tasks with priority > 70 get a red left border accent (`border-l-4 border-red-500`).
- **Expected Outcome:** Each task shows its context and actions clearly.
- **Acceptance Criteria:** Task type icons are correct. Primary action button matches task type. Done/Snooze call callbacks.

---

### 10.4 — Build the Tasks Page

- **Objective:** Assemble the full Tasks page with prioritized task list.
- **Files to modify:** `apps/web/src/app/(app)/tasks/page.tsx`
- **Prerequisites:** 10.1, 10.3
- **Steps:**
  1. Replace placeholder.
  2. Add `<PageHeader title="Tasks" subtitle="Your prioritized work for today" />`.
  3. Add tab filters using shadcn `<Tabs>`:
     - "Today" (pending tasks due today)
     - "All Pending" (all pending tasks)
     - "Snoozed"
     - "Done"
  4. Fetch tasks from `GET /api/tasks` with appropriate status filter based on active tab.
  5. Render a vertical list of `<TaskCard>` components.
  6. Create `loading.tsx` (skeleton cards) and `error.tsx`.
- **Expected Outcome:** `/tasks` shows all tasks grouped by status with action buttons.
- **Acceptance Criteria:** Tab filters show the correct tasks. Marking a task done removes it from the active tab.

---

### 10.5 — Create the Tasks Empty State

- **Objective:** Show a motivating empty state when there are no tasks for today.
- **Files to modify:** `apps/web/src/app/(app)/tasks/page.tsx`
- **Prerequisites:** 10.4, 5.4
- **Steps:**
  1. When the filtered task list is empty, render `<EmptyState>` with:
     - Icon: `CheckCircle2` (Lucide, green)
     - Title: `"All caught up!"`
     - Description: `"No tasks for today. Great work."`
- **Expected Outcome:** Empty task list shows a positive empty state.
- **Acceptance Criteria:** Empty state renders when tasks array is empty.

---

## Phase 11 — Messages & WhatsApp Integration

### 11.1 — Create a Meta Developer App

👤 **YOU DO THIS ONE** — WhatsApp setup happens on Meta's site, not in code.

- **Objective:** Set up the Meta developer application to use the WhatsApp Cloud API.
- **Prerequisites:** 2.4
- **Steps:**
  1. Go to https://developers.facebook.com and create a new app (type: Business).
  2. Add the "WhatsApp" product to the app.
  3. Set up a test phone number in the WhatsApp section.
  4. Copy `Access Token` to `WHATSAPP_ACCESS_TOKEN` in `.env.local`.
  5. Copy `Phone Number ID` to `WHATSAPP_PHONE_NUMBER_ID` in `.env.local`.
  6. Choose a random string for `WHATSAPP_VERIFY_TOKEN` and add to `.env.local`.
- **Expected Outcome:** WhatsApp API credentials are ready in `.env.local`.
- **Acceptance Criteria:** All three env vars are non-empty in `.env.local`.

---

### 11.2 — Create the WhatsApp Service Module

- **Objective:** Create a service module that wraps the WhatsApp Cloud API for sending messages.
- **Files to create:**
  - `services/whatsapp/package.json`
  - `services/whatsapp/index.ts`
- **Prerequisites:** 11.1
- **Steps:**
  1. Create `services/whatsapp/package.json` with name `@autostate/whatsapp`.
  2. Install axios: `pnpm add axios --filter @autostate/whatsapp`
  3. Create `services/whatsapp/index.ts` with:
     - `sendTextMessage(to: string, message: string): Promise<{ whatsappId: string }>` — POSTs to `https://graph.facebook.com/v18.0/{phoneNumberId}/messages`.
     - `sendTemplateMessage(to: string, templateName: string, components: object[]): Promise<{ whatsappId: string }>` — sends a pre-approved template.
  4. Both functions use `WHATSAPP_ACCESS_TOKEN` from env as Bearer token.
  5. Both functions throw descriptive errors on API failure.
- **Expected Outcome:** WhatsApp messages can be sent programmatically.
- **Acceptance Criteria:** Calling `sendTextMessage` with a valid sandbox number sends a WhatsApp message.

---

### 11.3 — Create the WhatsApp Webhook Route

👤 **PARTLY YOU** — Antigravity writes the route, but pointing Meta at it (during local dev) needs a tunnel tool like ngrok, which you'll run yourself.

- **Objective:** Receive incoming WhatsApp replies from Meta and store them in the database.
- **Files to create:** `apps/web/src/app/api/webhooks/whatsapp/route.ts`
- **Prerequisites:** 11.1, 11.2, 3.12
- **Steps:**
  1. Create `GET /api/webhooks/whatsapp`:
     - Read `hub.mode`, `hub.verify_token`, `hub.challenge` from query params.
     - If `hub.verify_token === WHATSAPP_VERIFY_TOKEN`, respond with `hub.challenge` as plain text `200`.
     - Otherwise respond `403`.
  2. Create `POST /api/webhooks/whatsapp`:
     - Parse the incoming payload (Meta sends a complex JSON object).
     - Extract: sender phone (`from`), message text (`text.body`), WhatsApp message ID (`id`), timestamp.
     - Find the `Customer` by matching phone number (`customer.phone = from`).
     - If customer found: create a `Message` record with `direction = INCOMING`, `type = WHATSAPP`, `whatsappId = id`.
     - Send Inngest event: `inngest.send({ name: 'whatsapp.message.received', data: { messageId } })`.
     - Always return `200 OK` immediately.
- **Expected Outcome:** Incoming WhatsApp replies are stored in DB and trigger AI processing.
- **Acceptance Criteria:** Webhook verification passes (Meta dashboard shows "Webhook verified"). Incoming test message creates a `Message` record.

---

### 11.4 — Create the Messages List API Route

- **Objective:** Return a list of all customer conversations with their latest message (inbox view).
- **Files to create:** `apps/web/src/app/api/messages/route.ts`
- **Prerequisites:** 3.12, 4.7
- **Steps:**
  1. Create `GET /api/messages`.
  2. Query customers that have at least one message, filtered by `companyId`.
  3. For each, include: customer name, phone, latest message text (truncated to 100 chars), latest message timestamp, count of unprocessed incoming messages.
  4. Order by most recent message timestamp descending.
- **Expected Outcome:** Inbox-style view of all active conversations.
- **Acceptance Criteria:** Returns customers with latest message data, ordered by recency.

---

### 11.5 — Create the Message Inbox Component

- **Objective:** Build the inbox-style conversation list for the Messages page.
- **Files to create:** `apps/web/src/components/messages/message-inbox.tsx`
- **Prerequisites:** 11.4, 2.7
- **Steps:**
  1. Create `MessageInbox` as a `"use client"` component.
  2. Render a scrollable list of conversation rows.
  3. Each row contains:
     - Customer avatar: a colored circle with the first letter of the customer's name.
     - Customer name (bold).
     - Last message preview (truncated, muted).
     - Relative timestamp (`formatDistanceToNow` from `date-fns`).
     - Unread badge: red circle with count if `unreadCount > 0`.
  4. Clicking a row calls an `onSelect(customerId)` prop.
  5. Selected row is highlighted.
- **Expected Outcome:** Inbox list looks like a messaging app.
- **Acceptance Criteria:** Conversations listed with correct data. Click calls `onSelect`. Selected row highlighted.

---

### 11.6 — Create the Conversation Detail Component

- **Objective:** Build the full conversation view for a selected customer.
- **Files to create:** `apps/web/src/components/messages/conversation-detail.tsx`
- **Prerequisites:** 11.5, 8.7
- **Steps:**
  1. Create `ConversationDetail` as a `"use client"` component accepting `customerId: string`.
  2. Fetch all messages for the customer.
  3. Render `<CommunicationTimeline messages={messages} />`.
  4. Add a message composer at the bottom:
     - `<Textarea>` for typing a message.
     - `"Generate AI Message"` button (calls `GET /api/customers/:id/generate-message`, see 12.8).
     - `"Send"` button (calls `POST /api/customers/:id/messages`).
  5. Show the AI promise detection panel when `parsedReply.intent === 'promise_to_pay'`:
     - Title: "AI Detected: Promise to Pay"
     - Detected date and amount.
     - Confidence percentage.
     - `[Yes, Save Promise]` button → calls `POST /api/promises`.
     - `[Dismiss]` button → hides the panel.
- **Expected Outcome:** Full conversation with AI promise detection.
- **Acceptance Criteria:** All messages render. AI promise panel appears for promise messages. Yes/Dismiss work correctly.

---

### 11.7 — Build the Messages Page

- **Objective:** Assemble the full Messages page with inbox + conversation detail layout.
- **Files to modify:** `apps/web/src/app/(app)/messages/page.tsx`
- **Prerequisites:** 11.5, 11.6
- **Steps:**
  1. Replace placeholder.
  2. Render `<PageHeader title="Messages" />`.
  3. Create a two-column layout:
     - Left column (`w-1/3 border-r border-surface-border`): `<MessageInbox>` list.
     - Right column (`flex-1`): `<ConversationDetail>` panel OR empty state if no conversation is selected.
  4. Manage selected conversation ID in component state.
  5. On mobile (`< md`): show inbox list; on selecting a conversation, show only the detail view with a back button.
- **Expected Outcome:** `/messages` is a functional messaging interface.
- **Acceptance Criteria:** Inbox loads with real conversations. Clicking one shows the full thread.

---

### 11.8 — Create the Send Message API Route

- **Objective:** Allow the user to send a WhatsApp message to a customer from the in-app composer.
- **Files to create:** `apps/web/src/app/api/customers/[id]/messages/route.ts`
- **Prerequisites:** 11.2, 3.12
- **Steps:**
  1. Create `POST /api/customers/:id/messages`.
  2. Accept body: `{ content: string, type: 'WHATSAPP' | 'EMAIL' }`. Validate with Zod.
  3. If `type = 'WHATSAPP'`: call `sendTextMessage(customer.phone, content)` from the WhatsApp service.
  4. Create a `Message` record: `direction = OUTGOING`, `type`, `content`, `whatsappId` (from API response).
  5. Return the created message.
- **Expected Outcome:** Messages sent from the app are delivered via WhatsApp and stored in DB.
- **Acceptance Criteria:** POST sends the WhatsApp message and creates a `Message` record with `direction = OUTGOING`.

---

## Phase 12 — AI Features

### 12.1 — Set Up the `packages/ai` Package

- **Objective:** Create a shared AI service package that is not locked to any single AI provider — swapping models later should mean changing an env var, not rewriting code.
- **Files to create:**
  - `packages/ai/package.json`
  - `packages/ai/models.ts`
  - `packages/ai/index.ts`
- **Prerequisites:** 1.4, 2.5
- **Steps:**
  1. Create `packages/ai/package.json` with name `@autostate/ai`.
  2. Install: `pnpm add ai @ai-sdk/gateway --filter @autostate/ai` (the Vercel AI SDK + AI Gateway — this works with Anthropic, OpenAI, Google, and dozens of other providers through one API key and one code path).
  3. Create `packages/ai/models.ts`:
     ```ts
     import { gateway } from '@ai-sdk/gateway'

     // Model choice lives in env vars, not code. Change AI_FAST_MODEL / AI_SUMMARY_MODEL
     // in .env.local to swap providers — e.g. 'anthropic/claude-haiku-4-5',
     // 'openai/gpt-5-mini', or 'google/gemini-3.5-flash'. No other code changes needed.
     export const fastModel = gateway(process.env.AI_FAST_MODEL ?? 'anthropic/claude-haiku-4-5')
     export const summaryModel = gateway(process.env.AI_SUMMARY_MODEL ?? 'anthropic/claude-sonnet-5')
     ```
  4. Create `packages/ai/index.ts` that re-exports from all AI modules.
  5. Add `@autostate/ai` as a workspace dependency in `apps/web/package.json`.
  6. Add `AI_GATEWAY_API_KEY`, `AI_FAST_MODEL`, `AI_SUMMARY_MODEL` to `.env.local` (see 2.4). Get the gateway key from the Vercel dashboard → AI Gateway → API Keys.
- **Expected Outcome:** A fast model and a higher-quality model are available as named exports, and either can be swapped to any supported provider by editing `.env.local` only.
- **Acceptance Criteria:** `import { fastModel } from '@autostate/ai'` resolves without error. Changing `AI_FAST_MODEL` to a different provider string and restarting the app uses the new model with no code edits.

---

### 12.2 — Build the Prioritization Engine

- **Objective:** Implement the rule-based scoring algorithm that gives each customer a priority score 0–100.
- **Files to create:** `packages/ai/prioritization.ts`
- **Prerequisites:** 12.1
- **Steps:**
  1. Define the `CustomerWithInvoicesAndPromises` type (Customer + Invoice[] + Promise[]).
  2. Create `calculatePriorityScore(customer: CustomerWithInvoicesAndPromises): number`.
  3. Scoring rules (accumulate, cap at 100):
     - Days overdue on oldest invoice: `+1 per day` (max 40 points)
     - Total outstanding amount: `+10 if > ₹1L`, `+20 if > ₹5L`, `+30 if > ₹10L`
     - Broken promises: `+10 per broken promise` (max 30 points)
     - Good payer (all invoices paid within 45 days historically): `-10`
     - No contact in last 7 days: `+5`
  4. Score floor: 0. Score ceiling: 100.
  5. Export the function.
- **Expected Outcome:** Deterministic priority score for each customer.
- **Acceptance Criteria:** Function is pure (same inputs = same output). Scores always 0–100. High-risk customer scores significantly higher than low-risk customer.

---

### 12.3 — Create the Task Generation Service

- **Objective:** Build the service that auto-creates `Task` records based on customer risk data.
- **Files to create:** `packages/ai/task-generator.ts`
- **Prerequisites:** 12.2, 3.11
- **Steps:**
  1. Create `generateTasksForCompany(companyId: string): Promise<void>` function.
  2. Fetch all customers with overdue invoices, their promises, and recent messages.
  3. For each customer:
     a. Calculate `priorityScore` using `calculatePriorityScore`.
     b. Determine task type:
        - Has a broken promise → `ESCALATE`
        - Has a `PENDING` promise due today or earlier → `SEND_REMINDER`
        - No message sent in last 3 days and overdue → `CALL`
        - Default → `FOLLOW_UP`
     c. Upsert a `Task` record (update if exists, create if not) with the new `priority`, `taskType`, and `reason`.
  4. Delete `PENDING` tasks for customers who no longer have overdue invoices.
- **Expected Outcome:** Tasks are always up to date with current customer status.
- **Acceptance Criteria:** Running the function creates correct tasks. Re-running it updates existing tasks rather than duplicating them.

---

### 12.4 — Build the AI Reply Parser

- **Objective:** Use the fast model to extract intent, date, and amount from an incoming customer message.
- **Files to create:** `packages/ai/reply-parser.ts`
- **Prerequisites:** 12.1
- **Steps:**
  1. Define `ParsedReply` type: `{ intent: 'promise_to_pay' | 'dispute' | 'acknowledgement' | 'other', date: string | null, amount: number | null, confidence: number }`.
  2. Create `parseReply(message: string, customerName: string): Promise<ParsedReply>` function.
  3. Construct the prompt:
     ```
     You are an accounts receivable assistant. A customer named {customerName} sent this message:
     "{message}"
     Parse the intent. Respond ONLY with valid JSON matching this schema:
     { "intent": "promise_to_pay"|"dispute"|"acknowledgement"|"other", "date": "YYYY-MM-DD"|null, "amount": number|null, "confidence": number }
     Today's date is {today}. If the customer mentions "next Tuesday", resolve it to the actual date.
     ```
  4. Call `generateText({ model: fastModel, prompt })` from the `ai` package. Parse the JSON response.
  5. If JSON parsing fails, return `{ intent: 'other', date: null, amount: null, confidence: 0 }`.
- **Expected Outcome:** Incoming messages are classified with intent and extracted data.
- **Acceptance Criteria:** "Will pay next Tuesday" returns `intent: 'promise_to_pay'`. "I already paid" returns `intent: 'acknowledgement'`. Malformed AI response does not throw.

---

### 12.5 — Build the WhatsApp Message Generator

- **Objective:** Use the fast model to generate a personalized WhatsApp collection message.
- **Files to create:** `packages/ai/message-generator.ts`
- **Prerequisites:** 12.1
- **Steps:**
  1. Define `MessageGenerationParams` type: `{ customerName: string, outstandingAmount: number, daysOverdue: number, invoiceNumbers: string[], language: string, tone: 'formal' | 'friendly' | 'firm', recentMessages: string[] }`.
  2. Create `generateCollectionMessage(params: MessageGenerationParams): Promise<string>` function.
  3. Construct a prompt for the fast model asking for a short, professional WhatsApp message.
  4. Include recent conversation history in the prompt for context.
  5. Return the raw generated text string.
- **Expected Outcome:** Personalized collection messages are generated instantly.
- **Acceptance Criteria:** Generated message mentions the customer name, amount owed, and invoice numbers. Message is under 300 characters. Different tones produce noticeably different outputs.

---

### 12.6 — Build the Relationship Summary Generator

- **Objective:** Use the summary model to write a 2–3 sentence summary of a customer's payment behavior.
- **Files to create:** `packages/ai/relationship-summary.ts`
- **Prerequisites:** 12.1
- **Steps:**
  1. Define `RelationshipSummaryParams` type: `{ customerName: string, invoices: Invoice[], messages: Message[], promises: Promise[] }`.
  2. Create `generateRelationshipSummary(params: RelationshipSummaryParams): Promise<string>` function.
  3. Construct a prompt for the summary model with all customer history, asking for a 2–3 sentence behavioral summary.
  4. Instructions in prompt: be factual, avoid legal language, focus on delay patterns, response channels, and reliability.
  5. Return the summary string.
- **Expected Outcome:** Customer profiles show AI-generated behavioral insights.
- **Acceptance Criteria:** Generated summary is 2–4 sentences. Mentions specific patterns (e.g., "typically pays 30–45 days late").

---

### 12.7 — Create the AI Summary API Route

- **Objective:** Build the API endpoint that generates or retrieves cached AI summaries for a customer.
- **Files to create:** `apps/web/src/app/api/customers/[id]/ai-summary/route.ts`
- **Prerequisites:** 12.6, 4.7, 3.12
- **Steps:**
  1. Create `GET /api/customers/:id/ai-summary`.
  2. Fetch the customer with `aiSummary` and `aiSummaryUpdatedAt` fields.
  3. If `aiSummaryUpdatedAt` is within the last 24 hours: return `{ summary: customer.aiSummary, cached: true }`.
  4. If stale or null: call `generateRelationshipSummary` with customer data. Save the result to `customer.aiSummary` and `customer.aiSummaryUpdatedAt`. Return `{ summary, cached: false }`.
- **Expected Outcome:** AI summaries load fast from cache and refresh daily.
- **Acceptance Criteria:** First call generates and stores a summary. Second call within 24h returns cached without calling the AI model.

---

### 12.8 — Create the Generate Message API Route

- **Objective:** Allow the UI to trigger AI message generation for a specific customer.
- **Files to create:** `apps/web/src/app/api/customers/[id]/generate-message/route.ts`
- **Prerequisites:** 12.5, 4.7
- **Steps:**
  1. Create `POST /api/customers/:id/generate-message`.
  2. Accept body: `{ tone: 'formal' | 'friendly' | 'firm', language: string }`. Validate with Zod.
  3. Fetch customer with invoices and last 3 messages.
  4. Call `generateCollectionMessage` with all params.
  5. Return `{ message: string }`.
- **Expected Outcome:** UI can generate messages with one API call.
- **Acceptance Criteria:** Returns a non-empty message string. Different tones produce different outputs.

---

### 12.9 — Create the "Generate Message" Modal

- **Objective:** Build the full UI flow for generating and sending AI collection messages.
- **Files to create:** `apps/web/src/components/ai/generate-message-modal.tsx`
- **Prerequisites:** 12.8, 11.8, 2.7
- **Steps:**
  1. Create `GenerateMessageModal` as a `"use client"` component using shadcn `<Dialog>`.
  2. Modal content:
     - **Tone selector**: three radio buttons — Formal / Friendly / Firm.
     - **Language selector**: `<Select>` with options English / Hindi / Hinglish.
     - **Generate button**: triggers `POST /api/customers/:id/generate-message`. Show `<LoadingSpinner>` while waiting.
     - **Message text area**: editable `<Textarea>` pre-filled with AI output.
     - **Send via WhatsApp button**: triggers `POST /api/customers/:id/messages`.
     - **Copy to Clipboard button**: copies the text area content.
  3. Reset the form when the modal closes.
- **Expected Outcome:** Users can generate, edit, and send AI messages in one flow.
- **Acceptance Criteria:** Modal opens, AI generates a message, user can edit it, and send. Loading spinner shows during generation.

---

### 12.10 — Create the Promise Save API Route

- **Objective:** Allow saving AI-detected payment promises to the database.
- **Files to create:** `apps/web/src/app/api/promises/route.ts`
- **Prerequisites:** 3.12, 4.7
- **Steps:**
  1. Create `POST /api/promises`.
  2. Accept body: `{ customerId, messageId?, expectedDate, amount?, aiConfidence?, createdByAI: boolean }`. Validate with Zod.
  3. Create a `Promise` record.
  4. Create a follow-up `Task` with `taskType = 'FOLLOW_UP'` and `dueDate = expectedDate`, `reason = 'Promise to pay from customer'`.
  5. Return the created promise.
- **Expected Outcome:** Confirmed AI-detected promises are stored and a follow-up task is created.
- **Acceptance Criteria:** POST creates both a `Promise` and a `Task` record. Returns 400 if `customerId` or `expectedDate` is missing.

---

## Phase 13 — Reports Module

### 13.1 — Create the Reports API Route

- **Objective:** Build the API endpoint that returns all reporting metrics.
- **Files to create:** `apps/web/src/app/api/reports/route.ts`
- **Prerequisites:** 3.12, 4.7
- **Steps:**
  1. Create `GET /api/reports`.
  2. Accept query param: `period` (`month` | `quarter` | `year`, default `month`).
  3. Compute date range for the period.
  4. Query and return:
     - `totalOutstanding`: sum of `Invoice.outstandingAmount` where `status != 'PAID'`.
     - `collectedThisPeriod`: sum of `Invoice.amount` where `paidDate` is within the period.
     - `averageCollectionDays`: average of `(paidDate - issueDate)` in days for paid invoices in the period.
     - `recoveryRate`: `(collectedThisPeriod / totalBilledThisPeriod) * 100`.
     - `topDelayedCustomers`: top 5 customers by `totalOutstanding`, with their name and amount.
- **Expected Outcome:** All reporting metrics from a single API call.
- **Acceptance Criteria:** Returns all 5 keys. Period filter changes the results correctly.

---

### 13.2 — Build the Reports Page

- **Objective:** Assemble the Reports page with all key metrics.
- **Files to modify:** `apps/web/src/app/(app)/reports/page.tsx`
- **Prerequisites:** 13.1, 5.3
- **Steps:**
  1. Replace placeholder.
  2. Add `<PageHeader title="Reports" subtitle="Financial performance overview" />`.
  3. Add period selector: three `<Button variant="outline">` buttons — "This Month" / "This Quarter" / "This Year".
  4. Render 4 `<StatCard>` components in a `grid grid-cols-2 md:grid-cols-4 gap-4`:
     - Total Outstanding (₹)
     - Collected This Month (₹)
     - Average Collection Time (X days)
     - Recovery Rate (X%)
  5. Render a "Top Delayed Customers" table: Customer Name | Outstanding Amount.
  6. Create `loading.tsx` and `error.tsx`.
- **Expected Outcome:** `/reports` shows a clear financial performance overview.
- **Acceptance Criteria:** All metrics render. Period buttons change the data. Top 5 customers table is correct.

---

### 13.3 — Add Outstanding Trend Chart to Reports

- **Objective:** Add a line chart showing the outstanding balance trend over the selected period.
- **Files to create:** `apps/web/src/app/api/reports/trend/route.ts`
- **Files to modify:** `apps/web/src/app/(app)/reports/page.tsx`
- **Prerequisites:** 13.2
- **Steps:**
  1. Create `GET /api/reports/trend` that returns `{ date: string, outstanding: number }[]` data points for the last 30 days.
  2. In the reports page, render a `<LineChart>` from recharts:
     - Blue line (`stroke: '#3b82f6'`).
     - Dark background (`background: '#1e293b'`).
     - X-axis: formatted dates.
     - Y-axis: ₹ amounts.
     - Tooltip showing date + amount.
  3. Wrap the chart in a `<Card>` with title "Outstanding Balance Trend".
- **Expected Outcome:** Reports page includes a visual trend chart.
- **Acceptance Criteria:** Chart renders with real data. Axes are labeled. Tooltip shows on hover.

---

## Phase 14 — Settings Module

### 14.1 — Create the Settings Page Layout

- **Objective:** Build the Settings page with a tab-based layout for all settings sections.
- **Files to modify:** `apps/web/src/app/(app)/settings/page.tsx`
- **Files to create:** `apps/web/src/components/settings/settings-layout.tsx`
- **Prerequisites:** 2.7, 6.6
- **Steps:**
  1. Replace the placeholder settings page.
  2. Add `<PageHeader title="Settings" />`.
  3. Render `<SettingsLayout>` which uses shadcn `<Tabs>` with these tabs:
     - **Company** (default active)
     - **Users**
     - **WhatsApp**
     - **Email**
     - **Data Import**
  4. Each tab renders the corresponding sub-component (stub components initially).
- **Expected Outcome:** Settings page has a tabbed layout with all 5 sections.
- **Acceptance Criteria:** All 5 tabs are visible. Clicking each renders its content area.

---

### 14.2 — Create the Company Settings Tab

- **Objective:** Allow the company owner to view and update company details.
- **Files to create:**
  - `apps/web/src/app/(app)/settings/company/page.tsx`
  - `apps/web/src/app/api/settings/company/route.ts`
- **Prerequisites:** 14.1, 3.12
- **Steps:**
  1. Create a form with labeled `<Input>` fields: Company Name, GST Number, Phone, Email, Address.
  2. Pre-fill fields with current company data fetched from DB.
  3. Create `PATCH /api/settings/company`: get `companyId` from current user, update `Company` record, return updated company.
  4. On form submit, call the API. On success, show a toast: "Company settings saved."
  5. Disable the submit button while saving (`isLoading` state).
- **Expected Outcome:** Company details are editable from Settings.
- **Acceptance Criteria:** Form pre-populates. Saving updates the DB. Toast appears on success.

---

### 14.3 — Create the Users Settings Tab

- **Objective:** Allow the owner to view and manage team members.
- **Files to create:**
  - `apps/web/src/app/(app)/settings/users/page.tsx`
  - `apps/web/src/app/api/settings/users/route.ts`
  - `apps/web/src/app/api/settings/users/[id]/route.ts`
- **Prerequisites:** 14.1, 3.12
- **Steps:**
  1. Create `GET /api/settings/users` — returns all users for the current company.
  2. Create a users table: Name | Email | Role | Joined.
  3. Add a `<Select>` dropdown for role in each row (OWNER, ADMIN, MEMBER).
  4. Create `PATCH /api/settings/users/:id` to update a user's role.
  5. On role change, call the API and show a toast.
  6. Gate this entire tab: only users with `role = 'OWNER'` can see it; others see "Access Denied".
- **Expected Outcome:** Owners can see and manage all team members.
- **Acceptance Criteria:** Users table renders. Role change saves to DB. Non-owners see Access Denied.

---

### 14.4 — Create the WhatsApp Integration Settings Tab

- **Objective:** Allow users to view their WhatsApp configuration and test the connection.
- **Files to create:** `apps/web/src/app/(app)/settings/whatsapp/page.tsx`
- **Prerequisites:** 14.1, 11.2
- **Steps:**
  1. Create a form with masked `<Input>` fields for: WhatsApp Phone Number ID, Access Token (password type), Webhook Verify Token.
  2. Show a status indicator: green dot + "Connected" if env vars are set; red dot + "Not configured" if not.
  3. Add a "Test Connection" button that calls a `POST /api/settings/whatsapp/test` endpoint which sends a test WhatsApp message to the company's own number.
  4. Show the webhook URL that must be registered with Meta: `{APP_URL}/api/webhooks/whatsapp`.
- **Expected Outcome:** Users can verify their WhatsApp setup.
- **Acceptance Criteria:** Connection status shows. Test button sends a real WhatsApp message.

---

### 14.5 — Create the Email Integration Settings Tab

- **Objective:** Allow users to configure email settings.
- **Files to create:** `apps/web/src/app/(app)/settings/email/page.tsx`
- **Prerequisites:** 14.1
- **Steps:**
  1. Create a form with: From Email, From Name, SMTP Host, SMTP Port, Username, Password (or Resend API Key).
  2. Add a "Test Email" button.
  3. Save values to a new `CompanyIntegration` record in the database (or environment variable management).
- **Expected Outcome:** Email integration is configurable from Settings.
- **Acceptance Criteria:** Form saves config. Test email is delivered successfully.

---

### 14.6 — Create the Data Import Settings Tab

- **Objective:** Allow users to upload Excel/CSV files to import data, and view import history.
- **Files to create:** `apps/web/src/app/(app)/settings/import/page.tsx`
- **Prerequisites:** 14.1, 16.2
- **Steps:**
  1. Create a drag-and-drop file upload zone (`accept=".xlsx,.csv"`):
     - Dashed border, centered icon and text: "Drop your Excel file here or click to browse".
     - On file select, call `POST /api/import` with `multipart/form-data`.
  2. Show an import history table: File Name | Status | Rows Processed | Date.
  3. Use color-coded status badges: PENDING=gray, PROCESSING=blue with spinner, DONE=green, FAILED=red.
  4. Poll `GET /api/import/:id` every 3 seconds while any import has `status = PROCESSING`.
- **Expected Outcome:** Users can import data via drag-and-drop and see progress.
- **Acceptance Criteria:** File uploads. Import job appears. Status updates to DONE. History table shows past imports.

---

## Phase 15 — Background Jobs

### 15.1 — Set Up Inngest

- **Objective:** Configure Inngest for background job processing.
- **Files to create:**
  - `apps/web/src/inngest/client.ts`
  - `apps/web/src/inngest/functions/index.ts`
  - `apps/web/src/app/api/inngest/route.ts`
- **Prerequisites:** 2.5, 4.7
- **Steps:**
  1. Create `apps/web/src/inngest/client.ts`:
     ```ts
     import { Inngest } from 'inngest'
     export const inngest = new Inngest({ id: 'autostate' })
     ```
  2. Create `apps/web/src/inngest/functions/index.ts` exporting an empty array: `export const allFunctions = []`.
  3. Create `apps/web/src/app/api/inngest/route.ts`:
     ```ts
     import { serve } from 'inngest/next'
     import { inngest } from '@/inngest/client'
     import { allFunctions } from '@/inngest/functions'
     export const { GET, POST, PUT } = serve({ client: inngest, functions: allFunctions })
     ```
  4. Set `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` in `.env.local`.
- **Expected Outcome:** Inngest serve endpoint is live.
- **Acceptance Criteria:** `GET /api/inngest` returns 200. Inngest Dev Server can connect to `localhost:3000/api/inngest`.

---

### 15.2 — Create the "Parse Incoming WhatsApp Reply" Job

- **Objective:** Asynchronously parse incoming WhatsApp messages for payment intent.
- **Files to create:** `apps/web/src/inngest/functions/parse-whatsapp-reply.ts`
- **Prerequisites:** 15.1, 12.4, 3.12
- **Steps:**
  1. Create an Inngest function triggered by `whatsapp.message.received` event.
  2. Function steps:
     a. Fetch the message from DB by `event.data.messageId`.
     b. Call `parseReply(message.content, message.customer.name)` from `@autostate/ai`.
     c. Update `message.aiSummary` with the parsed intent as a human-readable string.
     d. If `intent === 'promise_to_pay'` and `confidence > 0.85`: create a `Promise` record with `createdByAI = true`, `aiConfidence = confidence`.
     e. Create a follow-up `Task` if a promise was created.
  3. Add the function to `apps/web/src/inngest/functions/index.ts`.
- **Expected Outcome:** Incoming replies are automatically parsed for promises within seconds.
- **Acceptance Criteria:** A test message containing "Will pay next week" creates a `Promise` record in the database with `createdByAI = true`.

---

### 15.3 — Create the Daily Task Generation Job

- **Objective:** Auto-regenerate all tasks every morning so today's work list is always fresh.
- **Files to create:** `apps/web/src/inngest/functions/daily-task-generation.ts`
- **Prerequisites:** 15.1, 12.3
- **Steps:**
  1. Create an Inngest cron function: runs every day at `0 1 * * *` (1:30 AM UTC = 7 AM IST).
  2. Fetch all company IDs from the database.
  3. For each company, call `generateTasksForCompany(companyId)` from `@autostate/ai`.
  4. Log the number of tasks created/updated per company.
  5. Add to `allFunctions`.
- **Expected Outcome:** Tasks are refreshed every morning before users log in.
- **Acceptance Criteria:** Cron appears in the Inngest dashboard. Running it manually creates tasks in the DB.

---

### 15.4 — Create the Promise Follow-Up Check Job

- **Objective:** Daily job that auto-detects broken promises and creates escalation tasks.
- **Files to create:** `apps/web/src/inngest/functions/promise-follow-up.ts`
- **Prerequisites:** 15.1, 3.12
- **Steps:**
  1. Create an Inngest cron function: runs every day at `0 3 * * *` (3:30 AM UTC = 9 AM IST).
  2. Fetch all `Promise` records where `status = 'PENDING'` and `expectedDate < today`.
  3. For each promise:
     a. Check if any invoice for that customer was paid after the promise was created.
     b. If paid: `promise.status = 'KEPT'`.
     c. If not paid: `promise.status = 'BROKEN'`. Create a `Task` with `taskType = 'ESCALATE'`, `reason = 'Customer broke payment promise'`.
  4. Add to `allFunctions`.
- **Expected Outcome:** Broken promises are automatically detected and escalated.
- **Acceptance Criteria:** Promises past due date become BROKEN. ESCALATE tasks are created automatically.

---

## Phase 16 — Data Import

### 16.1 — Create the Importer Service

- **Objective:** Build the Excel/CSV parser that reads uploaded files and returns structured data.
- **Files to create:**
  - `services/importer/package.json`
  - `services/importer/index.ts`
- **Prerequisites:** 1.4, 3.11
- **Steps:**
  1. Create `services/importer/package.json` with name `@autostate/importer`.
  2. Install: `pnpm add xlsx --filter @autostate/importer`
  3. Create `services/importer/index.ts` with `parseExcelFile(buffer: Buffer): ParsedData`.
  4. Expected Excel columns: `Customer Name`, `Phone`, `Email`, `GST`, `Invoice Number`, `Invoice Amount`, `Issue Date`, `Due Date`, `Outstanding Amount`, `Status`.
  5. Row validation rules: `Customer Name` is required. `Invoice Amount` must be a number. Dates must be parseable. Collect all row errors.
  6. Return: `{ customers: ParsedCustomer[], invoices: ParsedInvoice[], errors: { row: number, message: string }[] }`.
- **Expected Outcome:** Excel files are parsed into structured, validated data.
- **Acceptance Criteria:** Valid Excel returns correct objects. Invalid rows (missing name, bad dates) appear in `errors`.

---

### 16.2 — Create the File Upload API Route

- **Objective:** Accept file uploads, store in Supabase, and queue for async processing.
- **Files to create:** `apps/web/src/app/api/import/route.ts`
- **Prerequisites:** 16.1, 15.1, 3.12
- **Steps:**
  1. Install Supabase client: `pnpm add @supabase/supabase-js --filter @autostate/web`.
  2. Create `POST /api/import` accepting `multipart/form-data` with a `file` field.
  3. Read the file buffer from the request.
  4. Upload to Supabase Storage bucket `imports/` with a unique path: `{companyId}/{timestamp}-{filename}`.
  5. Create an `ImportJob` record: `status = 'PENDING'`, `fileName`, `companyId`.
  6. Send Inngest event: `{ name: 'import.file.uploaded', data: { jobId, filePath, companyId } }`.
  7. Return `{ jobId }` immediately (do not wait for processing).
- **Expected Outcome:** Files upload immediately; processing is async.
- **Acceptance Criteria:** Upload returns a `jobId` in < 2 seconds. `ImportJob` in DB has `status = 'PENDING'`.

---

### 16.3 — Create the Import Processing Inngest Job

- **Objective:** Process uploaded files asynchronously and import all data to the database.
- **Files to create:** `apps/web/src/inngest/functions/process-import.ts`
- **Prerequisites:** 15.1, 16.1, 16.2
- **Steps:**
  1. Create an Inngest function triggered by `import.file.uploaded` event.
  2. Update `ImportJob.status = 'PROCESSING'`.
  3. Download the file from Supabase Storage using the `filePath` from the event.
  4. Call `parseExcelFile(buffer)` from `@autostate/importer`.
  5. Set `ImportJob.totalRows = customers.length + invoices.length`.
  6. For each customer: upsert by phone number or GST (find existing, create if not found). Increment `processedRows`.
  7. For each invoice: upsert by `[customerId, invoiceNumber]`. Increment `processedRows`.
  8. After all rows: call `generateTasksForCompany(companyId)` to create tasks from the new data.
  9. Update `ImportJob.status = 'DONE'`. Save `errorLog` if any rows had errors.
  10. Add to `allFunctions`.
- **Expected Outcome:** After upload, all customers and invoices appear in the database.
- **Acceptance Criteria:** After uploading a test Excel file, customers and invoices appear in Prisma Studio. `ImportJob.status` is `DONE`.

---

### 16.4 — Create the Import Status API Route

- **Objective:** Allow the frontend to check the status of an import job.
- **Files to create:** `apps/web/src/app/api/import/[id]/route.ts`
- **Prerequisites:** 3.12, 4.7
- **Steps:**
  1. Create `GET /api/import/:id`.
  2. Fetch `ImportJob` by ID.
  3. Security check: verify `importJob.companyId === user.companyId`.
  4. Return: `{ id, status, totalRows, processedRows, errorLog, createdAt, updatedAt }`.
- **Expected Outcome:** Frontend can poll this endpoint to show real-time progress.
- **Acceptance Criteria:** Returns current status. Progress percentage can be computed from `processedRows / totalRows`.

---

## Phase 17 — Testing

### 17.1 — Set Up Vitest

- **Objective:** Configure Vitest as the unit and integration test runner for the web app.
- **Files to create:**
  - `apps/web/vitest.config.ts`
  - `apps/web/src/test/setup.ts`
- **Prerequisites:** 1.7
- **Steps:**
  1. Install: `pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom --filter @autostate/web`
  2. Create `apps/web/vitest.config.ts`:
     ```ts
     import { defineConfig } from 'vitest/config'
     import react from '@vitejs/plugin-react'
     export default defineConfig({
       plugins: [react()],
       test: { environment: 'jsdom', setupFiles: './src/test/setup.ts' },
     })
     ```
  3. Create `apps/web/src/test/setup.ts`: `import '@testing-library/jest-dom'`
  4. Add `"test": "vitest"` to `apps/web/package.json` scripts.
- **Expected Outcome:** Vitest is configured and ready to run.
- **Acceptance Criteria:** `pnpm test` inside `apps/web` runs without crashing. Exit code 0.

---

### 17.2 — Write Unit Tests for the Prioritization Engine

- **Objective:** Verify the AI prioritization scoring logic is correct.
- **Files to create:** `packages/ai/prioritization.test.ts`
- **Prerequisites:** 12.2, 17.1
- **Steps:**
  1. Write tests:
     - Customer with 90 days overdue + ₹10L outstanding scores >= 80.
     - Customer with 0 days overdue scores <= 10.
     - Two broken promises adds >= 20 points vs zero broken promises.
     - Score never exceeds 100.
     - Score never goes below 0.
- **Expected Outcome:** Prioritization logic is verified.
- **Acceptance Criteria:** All 5 tests pass. `pnpm test` in `packages/ai` is green.

---

### 17.3 — Write Unit Tests for the Reply Parser

- **Objective:** Verify AI reply parsing returns correct structure with a mocked AI response.
- **Files to create:** `packages/ai/reply-parser.test.ts`
- **Prerequisites:** 12.4, 17.1
- **Steps:**
  1. Mock the AI SDK's `generateText` (using `fastModel`) to return preset JSON.
  2. Write tests:
     - "Will pay next Tuesday" → `intent = 'promise_to_pay'`.
     - "I already paid" → `intent = 'acknowledgement'`.
     - "OK" → `intent = 'acknowledgement'`.
     - AI response is malformed JSON → function returns `{ intent: 'other', confidence: 0 }` without throwing.
- **Expected Outcome:** Reply parser is tested against known inputs.
- **Acceptance Criteria:** All 4 tests pass with the mocked AI response.

---

### 17.4 — Write Unit Tests for the `CurrencyDisplay` Component

- **Objective:** Verify currency formatting is correct for Indian Rupees.
- **Files to create:** `apps/web/src/components/shared/currency-display.test.tsx`
- **Prerequisites:** 5.7, 17.1
- **Steps:**
  1. Write tests using React Testing Library:
     - `5200000` (full) → contains "52,00,000".
     - `5200000` (compact) → contains "52L".
     - `0` (full) → renders without crashing.
     - `100000` (compact) → contains "1L".
- **Expected Outcome:** Currency formatting is reliable.
- **Acceptance Criteria:** All 4 tests pass.

---

### 17.5 — Write Unit Tests for the `RiskBadge` Component

- **Objective:** Verify risk score color logic is correct.
- **Files to create:** `apps/web/src/components/shared/risk-badge.test.tsx`
- **Prerequisites:** 5.6, 17.1
- **Steps:**
  1. Write tests:
     - Score 20 → contains "Low" or green class.
     - Score 50 → contains "Medium" or yellow class.
     - Score 90 → contains "High" or red class.
     - Score 0 → renders without error.
     - Score 100 → renders without error.
- **Expected Outcome:** Risk badge color logic is verified.
- **Acceptance Criteria:** All 5 tests pass.

---

### 17.6 — Write API Integration Tests

- **Objective:** Test the key API routes with a test database.
- **Files to create:** `apps/web/src/test/api/customers.test.ts`
- **Prerequisites:** 17.1, 3.13
- **Steps:**
  1. Set up a test database (use the seeded dev DB or a separate test DB).
  2. Write tests:
     - `GET /api/customers` returns 200 with array and total.
     - `GET /api/customers/:id` returns 404 for a random UUID.
     - `POST /api/customers/:id/notes` with empty content returns 400.
     - `POST /api/customers/:id/notes` with valid content creates a Message record.
- **Expected Outcome:** API behavior is verified against a real DB.
- **Acceptance Criteria:** All 4 tests pass.

---

### 17.7 — Write End-to-End Tests with Playwright

- **Objective:** Test critical user flows from a real browser perspective.
- **Files to create:**
  - `apps/web/playwright.config.ts`
  - `apps/web/e2e/auth.test.ts`
  - `apps/web/e2e/dashboard.test.ts`
  - `apps/web/e2e/customers.test.ts`
- **Prerequisites:** all pages built, 17.1
- **Steps:**
  1. Install: `pnpm add -D @playwright/test --filter @autostate/web`. Run `npx playwright install`.
  2. Create `playwright.config.ts` pointing to `http://localhost:3000`.
  3. Write E2E tests:
     - **Auth flow**: Visit `/`, redirected to `/sign-in`, sign in with test credentials, lands on `/dashboard`.
     - **Dashboard**: After sign-in, see stats and "Today's Work" heading.
     - **Customer navigation**: Click Customers in sidebar, see the customer table.
     - **Task completion**: Click Done on a task, verify the task disappears from the list.
  4. Add `"test:e2e": "playwright test"` to `apps/web/package.json`.
- **Expected Outcome:** Critical flows pass in a real browser.
- **Acceptance Criteria:** All E2E tests pass against `localhost:3000`.

---

## Phase 18 — Deployment & DevOps

### 18.1 — Set Up Vercel Project

👤 **YOU DO THIS ONE** — deployment steps happen on each provider's website. Antigravity can tell you exactly what to click, but can't click it for you.

- **Objective:** Deploy the Next.js app to Vercel.
- **Prerequisites:** All features built and tested.
- **Steps:**
  1. Push the repository to GitHub.
  2. Go to https://vercel.com and create a new project from the GitHub repo.
  3. Set **Root Directory** to `apps/web`.
  4. Set **Framework Preset** to Next.js.
  5. Add all production environment variables from `.env.example` (fill in real values).
  6. Click Deploy.
- **Expected Outcome:** App is live on a Vercel URL.
- **Acceptance Criteria:** `https://your-app.vercel.app` loads the sign-in page with no errors.

---

### 18.2 — Set Up Railway PostgreSQL Database

👤 **YOU DO THIS ONE**

- **Objective:** Deploy a production PostgreSQL database on Railway.
- **Prerequisites:** 3.10
- **Steps:**
  1. Go to https://railway.app and create a new PostgreSQL service.
  2. Copy the `DATABASE_URL` connection string.
  3. Add `DATABASE_URL` to Vercel environment variables.
  4. Run from `packages/database`: `DATABASE_URL=<prod-url> npx prisma migrate deploy`.
- **Expected Outcome:** Production database is live with all tables.
- **Acceptance Criteria:** `npx prisma studio` can connect to Railway DB and shows all 8 tables.

---

### 18.3 — Set Up Supabase Storage

👤 **YOU DO THIS ONE**

- **Objective:** Configure Supabase for production file storage.
- **Prerequisites:** 16.2
- **Steps:**
  1. Create a Supabase project at https://supabase.com.
  2. Create a storage bucket named `imports` with **private** access policy.
  3. Add `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` to Vercel env vars.
- **Expected Outcome:** Supabase is ready for production file uploads.
- **Acceptance Criteria:** Uploading a file via the import API saves it to the Supabase `imports` bucket.

---

### 18.4 — Configure the WhatsApp Webhook on Meta (Production)

👤 **YOU DO THIS ONE**

- **Objective:** Register the production webhook URL with Meta.
- **Prerequisites:** 18.1, 11.3
- **Steps:**
  1. In Meta Developer Dashboard → WhatsApp → Configuration.
  2. Set Webhook URL: `https://your-app.vercel.app/api/webhooks/whatsapp`.
  3. Set Verify Token: value from `WHATSAPP_VERIFY_TOKEN` env var.
  4. Subscribe to the `messages` webhook field.
  5. Click "Verify and Save" — Meta will call the GET endpoint.
- **Expected Outcome:** Incoming WhatsApp messages reach the production webhook.
- **Acceptance Criteria:** Meta dashboard shows "Webhook verified".

---

### 18.5 — Configure the Clerk Webhook (Production)

👤 **YOU DO THIS ONE**

- **Objective:** Register the production Clerk webhook endpoint.
- **Prerequisites:** 18.1, 4.6
- **Steps:**
  1. Clerk Dashboard → Webhooks → Add endpoint.
  2. URL: `https://your-app.vercel.app/api/webhooks/clerk`.
  3. Subscribe to events: `user.created`, `user.updated`, `user.deleted`.
  4. Copy the signing secret to `CLERK_WEBHOOK_SECRET` in Vercel env vars.
- **Expected Outcome:** Clerk user events are delivered to the production webhook.
- **Acceptance Criteria:** Creating a test user in Clerk triggers the webhook and creates a DB record.

---

### 18.6 — Set Up Inngest in Production

👤 **YOU DO THIS ONE**

- **Objective:** Connect the production Inngest account to the deployed app.
- **Prerequisites:** 18.1, 15.1
- **Steps:**
  1. Go to https://inngest.com and create a production environment.
  2. Add `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` to Vercel env vars.
  3. In Inngest dashboard → Apps → Sync → point to `https://your-app.vercel.app/api/inngest`.
  4. Verify all functions and cron schedules appear in the dashboard.
- **Expected Outcome:** Background jobs run in production.
- **Acceptance Criteria:** Inngest dashboard shows all registered functions. Cron jobs show next scheduled time.

---

### 18.7 — Add Environment Variable Validation

- **Objective:** Make the app fail fast on startup if required environment variables are missing.
- **Files to create:** `apps/web/src/lib/env.ts`
- **Prerequisites:** 2.4, 2.5
- **Steps:**
  1. Create `apps/web/src/lib/env.ts` using Zod to validate all required env vars on startup.
  2. Include all keys from `.env.example` that are required (non-optional).
  3. Export the validated `env` object.
  4. Import `env` in `apps/web/src/app/layout.tsx` so validation runs on every server request.
- **Expected Outcome:** App crashes with a clear error if env vars are missing.
- **Acceptance Criteria:** Removing `DATABASE_URL` from env causes the app to throw a readable Zod error.

---

### 18.8 — Configure Custom Domain on Vercel

👤 **YOU DO THIS ONE** — optional for a first launch; skip and use the free vercel.app address if you don't have a domain yet.

- **Objective:** Add a production custom domain to the Vercel project.
- **Prerequisites:** 18.1
- **Steps:**
  1. Vercel → Project → Settings → Domains → Add domain (e.g., `app.autostate.in`).
  2. Update DNS records at the domain registrar as instructed by Vercel.
  3. Wait for SSL certificate to provision (usually < 5 minutes).
  4. Update `NEXT_PUBLIC_APP_URL` env var to the custom domain.
  5. Update Meta and Clerk webhook URLs to use the custom domain.
- **Expected Outcome:** App is accessible via the custom domain with HTTPS.
- **Acceptance Criteria:** `https://app.autostate.in` loads the app. SSL certificate is valid.

---

### 18.9 — Set Up Error Monitoring with Sentry

👤 **YOU DO THIS ONE** — optional for MVP, but 10 minutes well spent.

- **Objective:** Automatically capture and track production errors.
- **Files to create/modify:**
  - `apps/web/sentry.client.config.ts`
  - `apps/web/sentry.server.config.ts`
  - `apps/web/next.config.js`
- **Prerequisites:** 18.1
- **Steps:**
  1. Create a Sentry project at https://sentry.io.
  2. Install: `pnpm add @sentry/nextjs --filter @autostate/web`.
  3. Run `npx @sentry/wizard@latest -i nextjs` and follow prompts.
  4. Add `SENTRY_DSN` to Vercel env vars.
  5. Add `SENTRY_AUTH_TOKEN` for source map uploads.
- **Expected Outcome:** Production errors appear in Sentry automatically.
- **Acceptance Criteria:** Triggering a test error in production shows it in the Sentry dashboard within 30 seconds.

---

### 18.10 — Write the `DEPLOYMENT.md` Checklist

- **Objective:** Document the complete deployment process for future developers.
- **Files to create:** `/DEPLOYMENT.md`
- **Prerequisites:** 18.1–18.9
- **Steps:**
  1. Create `/DEPLOYMENT.md` at the repo root.
  2. Include sections:
     - **Prerequisites**: List of accounts to create (Vercel, Railway, Supabase, Clerk, Meta, Inngest, Sentry, domain registrar).
     - **Step-by-step deployment order**: numbered steps following tasks 18.1–18.9.
     - **Environment variables reference**: every env var, what it is, and where to find it.
     - **Database migration in production**: `npx prisma migrate deploy` command.
     - **Webhook setup**: URLs and instructions for WhatsApp and Clerk.
     - **How to roll back**: Vercel deployment rollback instructions.
     - **Troubleshooting**: common issues and fixes.
- **Expected Outcome:** Any developer can deploy the app following the checklist alone.
- **Acceptance Criteria:** Document is complete. A new developer can deploy using only this document (no verbal instructions needed).

---

## Phase 19 — Post-MVP Improvements

> These tasks are **out of scope for the MVP** and should be planned for the next iteration after launch and user validation.

### 19.1 — Add Charts to Dashboard
- **Objective:** Add a collections trend chart to the dashboard.
- **Notes:** MVP spec says "No charts initially." Add only after validating the core data experience with real users.
- **Depends on:** 13.3

---

### 19.2 — Add Email Integration
- **Objective:** Send collection emails in addition to WhatsApp.
- **Notes:** Integrate Resend or SendGrid. Add email messages to communication timeline.
- **Depends on:** 14.5

---

### 19.3 — Add Multi-Language AI Messages
- **Objective:** Generate messages in Hindi, Tamil, Telugu, and other Indian languages.
- **Notes:** Update the AI prompt with language selection. Test with native speakers.
- **Depends on:** 12.5

---

### 19.4 — Add ML-Based Prioritization
- **Objective:** Replace the rule-based priority engine with an ML model trained on payment outcomes.
- **Notes:** Collect 6 months of labeled data first (did the customer pay after a task was created?).
- **Depends on:** 12.2

---

### 19.5 — Add Mobile App (React Native)
- **Objective:** Build a React Native mobile app for on-the-go collection management.
- **Notes:** The REST API is already built. Focus on the mobile-optimized UI.
- **Depends on:** All API routes

---

### 19.6 — Add Accounts Receivable Aging Report
- **Objective:** Add a standard aging report with 0-30, 30-60, 60-90, 90+ day buckets.
- **Notes:** Classic AR report format that accountants expect.
- **Depends on:** 13.2

---

### 19.7 — Add Role-Based Access Control (RBAC)
- **Objective:** Restrict features based on user role (OWNER, ADMIN, MEMBER).
- **Notes:** Only OWNER can access Settings > Users. Only ADMIN+ can dismiss tasks.
- **Depends on:** 4.7, 14.3

---

### 19.8 — Add Audit Log
- **Objective:** Track every action taken on a customer record (who sent what, when).
- **Notes:** Add an `AuditLog` Prisma model. Log all creates, updates, deletes.
- **Depends on:** 3.11

---

### 19.9 — Add Bulk Actions
- **Objective:** Allow selecting multiple customers and sending a bulk reminder.
- **Notes:** Add checkboxes to customer table and a bulk action toolbar at the bottom.
- **Depends on:** 8.3, 12.9

---

### 19.10 — Add Customer-Facing Payment Portal
- **Objective:** Generate a unique payment link that customers can use to pay directly.
- **Notes:** Integrate Razorpay or Cashfree. Auto-mark invoice as PAID on successful payment webhook.
- **Depends on:** All phases

---

## Overall Completion Checklist

- [ ] **Phase 1**: Project Setup (1.1–1.9)
- [ ] **Phase 2**: Core Architecture (2.1–2.10)
- [ ] **Phase 3**: Database (3.1–3.13)
- [ ] **Phase 4**: Authentication (4.1–4.7)
- [ ] **Phase 5**: UI Foundation (5.1–5.8)
- [ ] **Phase 6**: Navigation & Layout (6.1–6.6)
- [ ] **Phase 7**: Dashboard (7.1–7.6)
- [ ] **Phase 8**: Customers Module (8.1–8.10)
- [ ] **Phase 9**: Invoices Module (9.1)
- [ ] **Phase 10**: Tasks Module (10.1–10.5)
- [ ] **Phase 11**: Messages & WhatsApp (11.1–11.8)
- [ ] **Phase 12**: AI Features (12.1–12.10)
- [ ] **Phase 13**: Reports (13.1–13.3)
- [ ] **Phase 14**: Settings (14.1–14.6)
- [ ] **Phase 15**: Background Jobs (15.1–15.4)
- [ ] **Phase 16**: Data Import (16.1–16.4)
- [ ] **Phase 17**: Testing (17.1–17.7)
- [ ] **Phase 18**: Deployment (18.1–18.10)
- [ ] **Phase 19**: Post-MVP (19.1–19.10 — optional, post-launch)

---

*Last updated: 2026-07-10 | Version: 1.1 — MVP Blueprint (2026 refresh)*
