-- ───────────────────────────────────────────────────────────────────────
-- tos_consent_log — forced-scroll Terms of Service confirmation audit.
--
-- DPDP Act compliance — affirmative consent + auditable scroll-to-bottom
-- + checkbox confirmation. Append-only.
--
-- profiles.tos_consent_version short-circuits the consent step once a
-- user has agreed to the current version. Future bumps (tos_v2, ...)
-- automatically re-prompt every existing user.
-- ───────────────────────────────────────────────────────────────────────

alter table public.profiles
  add column if not exists tos_consent_version text;

create table if not exists public.tos_consent_log (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles(id) on delete cascade,
  terms_version       text not null,        -- e.g. "tos_v1"
  ip_address          text,
  scrolled_to_bottom  boolean not null default true,
  created_at          timestamptz not null default now()
);

create index if not exists tos_consent_log_user_idx
  on public.tos_consent_log (user_id, created_at desc);

alter table public.tos_consent_log enable row level security;

-- Owner can read their own consent history (transparency).
drop policy if exists tos_consent_owner_read on public.tos_consent_log;
create policy tos_consent_owner_read on public.tos_consent_log
  for select using (auth.uid() = user_id);

-- Inserts only via service role (the /api/auth/tos-consent route).
-- No client-side insert policy.
