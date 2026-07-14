# 🔑 AI Gateway Key Renewal Reminder

> **EXPIRES:** ~30 days from **14 July 2026** → **~13 August 2026**

## What to do

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) → **AI** → **API Keys**
2. Generate a new key (set expiry as desired)
3. Update `AI_GATEWAY_API_KEY` in `apps/web/.env.local`
4. Restart the dev server

## What breaks if you forget

Every AI feature in the app will throw a **401 Unauthorized** error:
- Customer AI summaries (12.3)
- WhatsApp message generation (12.8)
- Reply parsing / promise detection (12.5)
- Priority scoring that uses AI (12.2)

## Env var location

```
apps/web/.env.local
AI_GATEWAY_API_KEY=<your-new-key-here>
```

## Current models configured

```
AI_FAST_MODEL=anthropic/claude-haiku-4-5      # task gen, reply parsing
AI_SUMMARY_MODEL=anthropic/claude-sonnet-5    # customer summaries, message drafting
```

> Swap either model by changing the env var — no code changes needed.
