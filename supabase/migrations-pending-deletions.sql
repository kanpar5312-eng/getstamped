-- ───────────────────────────────────────────────────────────────────────
-- pending_deletions — fallback queue for raw document files that could
-- not be deleted from the user-documents bucket immediately after their
-- Groq vision scan completed. A scheduled cleanup job retries them and
-- a separate sweep deletes any file older than 5 minutes regardless of
-- whether it ever made it into this queue.
--
-- DPDP Act compliance — data minimization. Do NOT add columns that
-- would persist any extracted text, PII, or file contents here. This
-- table is intentionally small: just enough to retry a single delete.
-- ───────────────────────────────────────────────────────────────────────

create table if not exists public.pending_deletions (
  id            uuid primary key default gen_random_uuid(),
  bucket        text not null,
  file_path     text not null,
  reason        text,                                  -- short error string from the original delete attempt
  attempts      int  not null default 0,
  created_at    timestamptz not null default now(),
  last_attempt_at timestamptz,
  unique (bucket, file_path)
);

create index if not exists pending_deletions_oldest_idx
  on public.pending_deletions (created_at asc);

-- Service-role only. Clients never touch this table.
alter table public.pending_deletions enable row level security;
-- Intentionally no policies: only the service-role key (used by the
-- /api/documents/check route and the /api/cron/storage-cleanup job)
-- can read or write here.
