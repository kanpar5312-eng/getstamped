-- =====================================================================
-- GetStamped — Supabase schema (run once in the SQL editor)
-- =====================================================================
-- Idempotent: re-running drops + recreates triggers/policies safely.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- profiles : 1-to-1 with auth.users, auto-created on signup
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  first_name            text,
  last_name             text,
  country               text,
  university            text,
  intake_term           text,                -- "Fall 2026", "Spring 2027", ...
  intake_date           date,
  interview_date        timestamptz,
  consulate             text,
  program_type          text,                -- "Undergrad" / "Master's" / "PhD"
  funding_source        text,                -- "family"/"loan"/"scholarship"/"mix"/"later"
  plan                  text not null default 'free' check (plan in ('free','solo','family')),
  visa_stamped          boolean not null default false,
  visa_stamped_at       timestamptz,
  onboarding_completed  boolean not null default false,
  created_at            timestamptz not null default now(),
  last_active_at        timestamptz not null default now()
);

-- Backfill safety for existing projects
alter table public.profiles
  add column if not exists onboarding_completed boolean not null default false;

-- Auto-create a profile row when a new auth user is inserted
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, first_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- step_progress : 47-step per-user state
-- ---------------------------------------------------------------------
create table if not exists public.step_progress (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  step_number   int  not null check (step_number between 1 and 47),
  status        text not null default 'not_started' check (status in ('not_started','in_progress','complete')),
  started_at    timestamptz,
  completed_at  timestamptz,
  notes         text,
  updated_at    timestamptz not null default now(),
  unique (user_id, step_number)
);

create index if not exists step_progress_user_idx
  on public.step_progress (user_id);

-- ---------------------------------------------------------------------
-- step_activity : append-only event log (drives the "stuck" detection)
-- ---------------------------------------------------------------------
create table if not exists public.step_activity (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  step_number int,
  action      text not null,    -- 'opened' | 'completed' | 'document_uploaded' | ...
  created_at  timestamptz not null default now()
);

create index if not exists step_activity_user_created_idx
  on public.step_activity (user_id, created_at desc);

-- ---------------------------------------------------------------------
-- waitlist : pre-launch signup (already used by /api/waitlist)
-- ---------------------------------------------------------------------
create table if not exists public.waitlist (
  id            uuid primary key default gen_random_uuid(),
  email         text unique not null,
  position      serial,
  country       text,
  intake        text,
  signed_up_at  timestamptz not null default now(),
  is_early_bird boolean not null default false,
  source        text
);

create or replace function public.mark_early_bird()
returns trigger language plpgsql as $$
begin
  if new.position <= 100 then new.is_early_bird := true; end if;
  return new;
end;
$$;

drop trigger if exists set_early_bird on public.waitlist;
create trigger set_early_bird
  before insert on public.waitlist
  for each row execute function public.mark_early_bird();

create or replace view public.waitlist_counts as
  select
    count(*)::int                                as total_signups,
    count(*) filter (where is_early_bird)::int  as early_bird_claimed
  from public.waitlist;

-- ---------------------------------------------------------------------
-- documents : user-uploaded files (metadata; bytes live in Storage)
-- ---------------------------------------------------------------------
create table if not exists public.documents (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  step_number   int  check (step_number between 1 and 47),
  phase         int  check (phase between 1 and 5),
  name          text not null,
  filename      text not null,
  storage_path  text not null unique,
  mime_type     text,
  size_bytes    bigint not null default 0,
  expires_at    timestamptz,
  required      boolean not null default false,
  deleted_at    timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists documents_user_idx on public.documents (user_id) where deleted_at is null;
create index if not exists documents_user_step_idx on public.documents (user_id, step_number) where deleted_at is null;

-- ---------------------------------------------------------------------
-- ai_threads + ai_messages : Ask conversation history
-- ---------------------------------------------------------------------
create table if not exists public.ai_threads (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  title       text not null default 'New conversation',
  step_number int,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists ai_threads_user_idx on public.ai_threads (user_id, updated_at desc);

create table if not exists public.ai_messages (
  id          uuid primary key default gen_random_uuid(),
  thread_id   uuid not null references public.ai_threads(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  role        text not null check (role in ('user','assistant','system')),
  content     text not null,
  created_at  timestamptz not null default now()
);
create index if not exists ai_messages_thread_idx on public.ai_messages (thread_id, created_at);

-- Per-user daily AI quota (free tier)
create table if not exists public.ai_quota (
  user_id   uuid not null references public.profiles(id) on delete cascade,
  day       date not null default current_date,
  count     int  not null default 0,
  primary key (user_id, day)
);

-- ---------------------------------------------------------------------
-- mock_interview_sessions : recorded Q&A + scores
-- ---------------------------------------------------------------------
create table if not exists public.mock_interview_sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  started_at   timestamptz not null default now(),
  ended_at     timestamptz,
  overall_score int,
  transcript   jsonb not null default '[]'::jsonb,
  feedback     jsonb
);
create index if not exists mock_sessions_user_idx on public.mock_interview_sessions (user_id, started_at desc);

-- ---------------------------------------------------------------------
-- notification preferences (lives on profiles for simplicity)
-- ---------------------------------------------------------------------
alter table public.profiles
  add column if not exists notif_prefs jsonb not null default '{"weekly_digest":true,"reminders":true,"product_updates":false}'::jsonb;

alter table public.profiles
  add column if not exists scheduled_deletion_at timestamptz;

alter table public.profiles
  add column if not exists welcome_sent_at timestamptz;

-- ---------------------------------------------------------------------
-- parent_view_tokens : public read-only share links
-- ---------------------------------------------------------------------
create table if not exists public.parent_view_tokens (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  token           text unique not null,
  enabled         boolean not null default true,
  views           int not null default 0,
  last_viewed_at  timestamptz,
  created_at      timestamptz not null default now()
);

-- =====================================================================
-- Row Level Security
-- =====================================================================

alter table public.profiles                enable row level security;
alter table public.step_progress           enable row level security;
alter table public.step_activity           enable row level security;
alter table public.waitlist                enable row level security;
alter table public.parent_view_tokens      enable row level security;
alter table public.documents               enable row level security;
alter table public.ai_threads              enable row level security;
alter table public.ai_messages             enable row level security;
alter table public.ai_quota                enable row level security;
alter table public.mock_interview_sessions enable row level security;

drop policy if exists documents_self on public.documents;
create policy documents_self on public.documents
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists ai_threads_self on public.ai_threads;
create policy ai_threads_self on public.ai_threads
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists ai_messages_self on public.ai_messages;
create policy ai_messages_self on public.ai_messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists ai_quota_self on public.ai_quota;
create policy ai_quota_self on public.ai_quota
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists mock_sessions_self on public.mock_interview_sessions;
create policy mock_sessions_self on public.mock_interview_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =====================================================================
-- Storage bucket: documents (private; user folder = auth.uid())
-- Run once via SQL editor; bucket created via dashboard or REST.
-- =====================================================================
-- insert into storage.buckets (id, name, public) values ('documents','documents', false)
--   on conflict (id) do nothing;

drop policy if exists docs_storage_select on storage.objects;
create policy docs_storage_select on storage.objects
  for select using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists docs_storage_insert on storage.objects;
create policy docs_storage_insert on storage.objects
  for insert with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists docs_storage_update on storage.objects;
create policy docs_storage_update on storage.objects
  for update using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists docs_storage_delete on storage.objects;
create policy docs_storage_delete on storage.objects
  for delete using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

-- profiles: each user sees + edits only their own row
drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles
  for select using (auth.uid() = id);

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- step_progress: same rule
drop policy if exists step_progress_self_select on public.step_progress;
create policy step_progress_self_select on public.step_progress
  for select using (auth.uid() = user_id);

drop policy if exists step_progress_self_write on public.step_progress;
create policy step_progress_self_write on public.step_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- step_activity: same
drop policy if exists step_activity_self_select on public.step_activity;
create policy step_activity_self_select on public.step_activity
  for select using (auth.uid() = user_id);

drop policy if exists step_activity_self_insert on public.step_activity;
create policy step_activity_self_insert on public.step_activity
  for insert with check (auth.uid() = user_id);

-- parent_view_tokens: owner-only writes; public reads happen via service role
drop policy if exists parent_tokens_self on public.parent_view_tokens;
create policy parent_tokens_self on public.parent_view_tokens
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- waitlist: public can insert; reads only via the aggregate view
drop policy if exists waitlist_insert_public on public.waitlist;
create policy waitlist_insert_public on public.waitlist
  for insert to anon with check (true);

grant select on public.waitlist_counts to anon;

-- =====================================================================
-- Realtime: enable in the Supabase dashboard (Database → Replication)
-- for: profiles, step_progress, step_activity
-- =====================================================================
