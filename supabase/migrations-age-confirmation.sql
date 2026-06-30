-- ───────────────────────────────────────────────────────────────────────
-- age_confirmation_log — affirmative confirmation, at signup, that the
-- user is 18+ (or using the service with parental consent).
--
-- DPDP Act compliance — affirmative consent + age gating. Append-only.
-- ───────────────────────────────────────────────────────────────────────

create table if not exists public.age_confirmation_log (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  ip_address   text,
  created_at   timestamptz not null default now()
);

create unique index if not exists age_confirmation_log_user_unique
  on public.age_confirmation_log (user_id);

create index if not exists age_confirmation_log_user_idx
  on public.age_confirmation_log (user_id, created_at desc);

alter table public.age_confirmation_log enable row level security;

-- Owner can read their own confirmation (transparency).
drop policy if exists age_confirm_owner_read on public.age_confirmation_log;
create policy age_confirm_owner_read on public.age_confirmation_log
  for select using (auth.uid() = user_id);

-- Inserts only via service role (the signUp server action).
-- No client-side insert policy.
