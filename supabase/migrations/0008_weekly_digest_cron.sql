-- ════════════════════════════════════════════════════════════════════════
-- 0008_weekly_digest_cron.sql
-- ──────────────────────────────────────────────────────────────────────
-- Schedules the POST /api/cron/weekly-digest endpoint via pg_cron + pg_net
-- to run every Sunday at 09:00 IST (03:30 UTC).
--
-- Set the secret + URL once before running this:
--   alter database postgres set app.cron_secret = '<paste-CRON_SECRET-here>';
--   alter database postgres set app.site_origin = 'https://getstamped.online';
-- ════════════════════════════════════════════════════════════════════════

-- Enable extensions (idempotent — Supabase's hosted Postgres has them).
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Replace the schedule if it already exists, otherwise create it.
select cron.unschedule('weekly-digest') where exists (
  select 1 from cron.job where jobname = 'weekly-digest'
);

select cron.schedule(
  'weekly-digest',
  '30 3 * * 0',           -- 03:30 UTC every Sunday = 09:00 IST
  $$
    select net.http_post(
      url     := current_setting('app.site_origin') || '/api/cron/weekly-digest',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.cron_secret'),
        'Content-Type',  'application/json'
      ),
      body    := '{}'::jsonb
    );
  $$
);
