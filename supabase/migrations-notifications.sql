-- Notifications table — server inserts, user reads + marks read.
-- Run once in Supabase SQL editor.

create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  kind        text not null,                -- "step_complete", "doc_checked", "interview_reminder", etc.
  title       text not null,
  body        text,
  href        text,                          -- optional click-through destination
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists notifications_user_unread_idx
  on public.notifications (user_id, created_at desc)
  where read_at is null;

create index if not exists notifications_user_recent_idx
  on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

-- Owner-only read
drop policy if exists notifications_owner_read on public.notifications;
create policy notifications_owner_read on public.notifications
  for select using (auth.uid() = user_id);

-- Owner-only update (mark read)
drop policy if exists notifications_owner_update on public.notifications;
create policy notifications_owner_update on public.notifications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- INSERTS go through the service role (server actions only).
-- No client insert policy.
