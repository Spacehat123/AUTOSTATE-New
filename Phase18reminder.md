# Phase 18 Reminders

## Clerk Webhooks
- [ ] Configure the webhook URL in the Clerk dashboard for the `user.deleted` event.
  - Point it to `https://<your-production-domain>/api/webhooks/clerk`.
- [ ] Obtain the Webhook Signing Secret (`whsec_...`) from the Clerk dashboard.
- [ ] Add the secret as `CLERK_WEBHOOK_SECRET` in the production environment variables (e.g. Vercel).
