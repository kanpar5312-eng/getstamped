-- ════════════════════════════════════════════════════════════════════════
-- 0009_step_updates_log.sql
-- ──────────────────────────────────────────────────────────────────────
-- Adds the column the step-updates cron uses to detect content changes,
-- a dedupe log so a user isn't pinged twice for the same step revision,
-- and the daily pg_cron schedule that hits /api/cron/step-updates.
-- ════════════════════════════════════════════════════════════════════════

-- 1) The "content updated" marker on each step. Set it whenever you
--    revise a step's title / description / what_to_upload.
alter table public.visa_steps
  add column if not exists last_content_update timestamptz;

-- 2) Dedupe log so we never email the same (user, step, content_version)
--    twice. content_version is just the last_content_update timestamp
--    truncated to seconds so a rapid double-edit still counts as one.
create table if not exists public.step_update_notifications (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  step_id         uuid not null references public.visa_steps(id) on delete cascade,
  content_version timestamptz not null,
  sent_at         timestamptz not null default now(),
  unique (user_id, step_id, content_version)
);

create index if not exists step_update_notifications_user_idx
  on public.step_update_notifications (user_id, sent_at desc);

alter table public.step_update_notifications enable row level security;
revoke all on public.step_update_notifications from anon, authenticated;

-- 3) Daily schedule: 04:00 UTC = 09:30 IST.
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.unschedule('step-updates') where exists (
  select 1 from cron.job where jobname = 'step-updates'
);

select cron.schedule(
  'step-updates',
  '0 4 * * *',
  $$
    select net.http_post(
      url     := current_setting('app.site_origin') || '/api/cron/step-updates',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.cron_secret'),
        'Content-Type',  'application/json'
      ),
      body    := '{}'::jsonb
    );
  $$
);
