-- ════════════════════════════════════════════════════════════════════════
-- 0005_email_reminders_log
-- Tracks every deadline reminder email the cron has sent. The (user_id,
-- step_id, days_before) unique key is what stops the same reminder from
-- firing twice across cron retries or a re-run after a crash.
--
-- pg_cron schedule (run from the Supabase SQL editor ONCE, not from this
-- file — pg_cron grants are project-level):
--
--   select cron.schedule(
--     'deadline-reminders-9am-ist',
--     '30 3 * * *',                                  -- 09:00 IST = 03:30 UTC
--     $$
--       select net.http_post(
--         url     := 'https://getstamped.app/api/cron/deadline-reminders',
--         headers := jsonb_build_object(
--           'Authorization', 'Bearer ' || current_setting('app.cron_secret'),
--           'Content-Type',  'application/json'
--         ),
--         body    := '{}'::jsonb
--       );
--     $$
--   );
--
-- Set the secret once with:
--   alter database postgres set app.cron_secret = '<paste-CRON_SECRET-here>';
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.email_reminders_log (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  step_id      uuid not null references public.visa_steps(id) on delete cascade,
  days_before  int  not null check (days_before in (30, 14, 7, 3)),
  sent_at      timestamptz not null default now(),
  unique (user_id, step_id, days_before)
);

create index if not exists email_reminders_log_user_idx
  on public.email_reminders_log (user_id, sent_at desc);

-- RLS: rows are only ever written by the service-role cron, and there's
-- no reason for a user to read them from the client. Lock it down.
alter table public.email_reminders_log enable row level security;
revoke all on public.email_reminders_log from anon, authenticated;
