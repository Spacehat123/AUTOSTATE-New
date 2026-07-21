# Autostate Database Backup & Recovery Procedure

This document outlines the standard procedures for verifying database backups and performing Point-In-Time Recovery (PITR) for the Autostate Postgres database hosted on Supabase (or Railway).

## 1. Automated Backups Overview

Supabase automatically handles daily backups and (depending on the plan) Point-In-Time Recovery.

- **Daily Backups**: A complete snapshot of the database is taken every 24 hours.
- **WAL Archiving**: For PITR, Write-Ahead Logs (WAL) are continuously archived, allowing recovery to any specific minute within the retention window (typically 7-28 days depending on the Pro/Enterprise plan).

## 2. Verifying Backups

You should verify that backups are running successfully on a regular basis (e.g., weekly).

1. Log in to the [Supabase Dashboard](https://supabase.com/dashboard).
2. Select the `Autostate` project.
3. Navigate to **Database** → **Backups**.
4. Check the **Daily Backups** list to ensure recent backups have a `Completed` status.
5. If PITR is enabled, navigate to the **Point in Time** tab and confirm that the latest restorable time is within the last few minutes.

## 3. Testing Recovery (Dry Run)

It is highly recommended to perform a recovery test quarterly to ensure data integrity and team readiness.

1. Create a new, temporary Supabase project (e.g., `Autostate-Recovery-Test`).
2. In the production `Autostate` project dashboard, go to **Database** → **Backups** → **Point in Time**.
3. Select a specific date and time to restore to.
4. Instead of restoring directly over production (which causes downtime and overwrites data), choose **Restore to a new project** (if supported by your plan) OR use the Supabase CLI to pull the backup and restore it locally:
   ```bash
   supabase db dump --db-url <production-db-url> -f backup.sql
   # Then apply to local or staging
   psql -h localhost -U postgres -d test_db < backup.sql
   ```
5. Verify that critical data (users, companies, invoices, messages) is present and uncorrupted.

## 4. Emergency Point-In-Time Recovery (Production)

**WARNING: Restoring the production database will cause downtime and overwrite all data written after the target restore time.**

If data loss or severe corruption occurs:

1. Immediately alert the team and put the application into maintenance mode if possible (to prevent further corrupt data entry).
2. Go to the Supabase Dashboard → **Database** → **Backups** → **Point in Time**.
3. Select the exact date and time immediately *before* the corrupting event occurred.
4. Click **Restore**.
5. Wait for the restoration process to complete (this can take several minutes to over an hour depending on database size).
6. Verify the application functions correctly and the corrupted data is gone.
7. Post-mortem: Identify the root cause and add preventative measures (e.g., stronger RBAC, better input validation).
