# Autostate Deployment Checklist

This document outlines the complete, end-to-end process for taking the Autostate MVP from local development to a live production environment.

## Prerequisites: Required Accounts

Before beginning the deployment, ensure you have active accounts created with the following providers:
- **GitHub**: For version control and triggering deployments.
- **Vercel**: For hosting the Next.js web application and API routes.
- **Supabase**: For both PostgreSQL Database and Object Storage (Buckets). *(Note: The original spec referenced Railway for PostgreSQL, but Supabase provides both out of the box).*
- **Clerk**: For user authentication.
- **Meta Developer**: For the WhatsApp Cloud API integration.
- **Inngest**: For background jobs and cron task scheduling.
- **Sentry**: For production error tracking and monitoring.
- **Domain Registrar**: (Optional) For assigning a custom domain to Vercel.

---

## 1. Environment Variables Reference

Gather the following keys. You will need to add these to your Vercel project before deploying.

| Variable | Description | Where to find it |
|----------|-------------|------------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Public Clerk auth key | Clerk Dashboard -> API Keys |
| `CLERK_SECRET_KEY` | Private Clerk auth key | Clerk Dashboard -> API Keys |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Route for sign in | Set to `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Route for sign up | Set to `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Route redirect | Set to `/dashboard` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Route redirect | Set to `/onboarding` |
| `CLERK_WEBHOOK_SECRET` | Verifies Clerk events | Clerk Dashboard -> Webhooks (Signing Secret) |
| `DATABASE_URL` | PostgreSQL connection string | Supabase -> Settings -> Database -> URI |
| `AI_GATEWAY_API_KEY` | Vercel AI Gateway Auth | Vercel -> Storage -> AI |
| `AI_FAST_MODEL` | Fast AI routing model | `anthropic/claude-haiku-4-5` or similar |
| `AI_SUMMARY_MODEL` | Slow/Smart AI model | `anthropic/claude-sonnet-5` or similar |
| `WHATSAPP_ACCESS_TOKEN` | Meta API Token | Meta Developer -> WhatsApp -> API Setup |
| `WHATSAPP_PHONE_NUMBER_ID` | Meta Phone ID | Meta Developer -> WhatsApp -> API Setup |
| `WHATSAPP_VERIFY_TOKEN` | Custom string you create | A random string you define (e.g., `my_secret_token`) |
| `SUPABASE_URL` | Supabase Project URL | Supabase -> Settings -> API |
| `SUPABASE_ANON_KEY` | Supabase Public Key | Supabase -> Settings -> API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Private Key | Supabase -> Settings -> API |
| `INNGEST_EVENT_KEY` | Inngest sending key | Inngest Dashboard -> Event Keys |
| `INNGEST_SIGNING_KEY` | Inngest webhook verifier | Inngest Dashboard -> Signing Keys |
| `SENTRY_DSN` | Sentry project identifier | Sentry Dashboard -> Client Keys (DSN) |
| `SENTRY_AUTH_TOKEN` | Sentry build uploads | Sentry Dashboard -> Auth Tokens |
| `NEXT_PUBLIC_APP_URL` | Your production URL | e.g. `https://autostate-official.vercel.app` |

---

## 2. Step-by-Step Deployment Order

### Step 1: Set Up Supabase (Database & Storage)
1. Create a new project in Supabase.
2. Go to **Settings -> Database** and copy the Connection String URI. This is your `DATABASE_URL`.
3. Go to **Storage**, create a new bucket named `imports` (Set to **Private**).
4. Go to **Settings -> API** and copy the Project URL (`SUPABASE_URL`), `anon public` key (`SUPABASE_ANON_KEY`), and `service_role` key (`SUPABASE_SERVICE_ROLE_KEY`).

### Step 2: Deploy to Vercel
1. Push your code to GitHub.
2. In Vercel, click **Add New -> Project** and import the repository.
3. Configure settings:
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/web`
4. Expand the **Environment Variables** section. Copy the entire contents of your local `.env.local` (with production keys) and paste it into the first Key box to auto-populate.
5. Click **Deploy**.

### Step 3: Database Migration in Production
The Vercel deployment will build the app, but your live Supabase database is still empty.
Run this command from your local terminal to push the Prisma schema to production:
```bash
$env:DATABASE_URL="YOUR_SUPABASE_CONNECTION_STRING_HERE"
npx prisma migrate deploy
```

### Step 4: Configure Webhooks
**WhatsApp Webhook:**
1. In the Meta Developer Dashboard, go to **WhatsApp -> Configuration**.
2. Click Edit Webhook.
3. **URL:** `https://your-domain.vercel.app/api/webhooks/whatsapp`
4. **Verify Token:** (Must match your `WHATSAPP_VERIFY_TOKEN` env var).
5. Subscribe to `messages`.

**Clerk Webhook:**
1. In the Clerk Dashboard, go to **Webhooks -> Add Endpoint**.
2. **URL:** `https://your-domain.vercel.app/api/webhooks/clerk`
3. Subscribe to `user.created`, `user.updated`, `user.deleted`.
4. Copy the Signing Secret and update the `CLERK_WEBHOOK_SECRET` in Vercel (Redeploy required).

### Step 5: Sync Inngest
1. Go to your Inngest Dashboard -> **Apps -> Sync**.
2. Point it to: `https://your-domain.vercel.app/api/inngest`.
3. Ensure all background jobs and cron schedules appear successfully.

---

## 3. How to Roll Back
If a deployment introduces a critical bug:
1. Go to the **Deployments** tab in Vercel.
2. Find the previous stable deployment in the list.
3. Click the three dots (`...`) on the right side of the row.
4. Select **Promote to Production** (or **Assign Custom Domains**).
5. Vercel will instantly swap the live traffic to the old build without rebuilding.

---

## 4. Troubleshooting

- **`supabaseUrl is required` or Zod Validation Crash during Build:**
  - *Fix:* Next.js checks environment variables at build time. Ensure *all* keys are present in Vercel's Environment Variables panel before triggering a build.
- **WhatsApp Messages not arriving:**
  - *Fix:* Check the Meta dashboard to ensure the Webhook shows as "Verified". If not, verify that `WHATSAPP_VERIFY_TOKEN` exactly matches between Meta and Vercel.
- **Inngest Sync fails with Unauthorized:**
  - *Fix:* Your `INNGEST_SIGNING_KEY` on Vercel is missing or incorrect. Update it and redeploy.
- **User creation fails (Clerk to Database):**
  - *Fix:* Check the Clerk Webhook logs. If they are failing with a 401/403, verify the `CLERK_WEBHOOK_SECRET` matches on Vercel.
