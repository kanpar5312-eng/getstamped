-- ───────────────────────────────────────────────────────────────────────
-- Document upload privacy consent.
--
-- DPDP Act compliance — affirmative consent log.
--
-- Two stores:
--   1. profiles.document_consent_version — short-circuits the modal once
--      a user has agreed to the CURRENT version. If we ever bump the
--      version (e.g. "document_upload_privacy_v2"), existing users will
--      see the modal again because their stored version no longer
--      matches the live constant.
--   2. document_consent_log — append-only audit row per confirmation,
--      with user_id, the version string, the ip_address we observed at
--      consent time, and the timestamp.
-- ───────────────────────────────────────────────────────────────────────

alter table public.profiles
  add column if not exists document_consent_version text;

create table if not exists public.document_consent_log (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  consent_type text not null,            -- e.g. "document_upload_privacy_v1"
  ip_address   text,                     -- may be null if not derivable
  created_at   timestamptz not null default now()
);

create index if not exists document_consent_log_user_idx
  on public.document_consent_log (user_id, created_at desc);

alter table public.document_consent_log enable row level security;

-- Owner can read their own consent history (transparency).
drop policy if exists doc_consent_owner_read on public.document_consent_log;
create policy doc_consent_owner_read on public.document_consent_log
  for select using (auth.uid() = user_id);

-- Inserts only via service role (server route).
-- No client-side insert policy.
