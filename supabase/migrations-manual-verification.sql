-- ───────────────────────────────────────────────────────────────────────
-- Manual document verification — privacy-conscious alternative to AI
-- upload. Adds a column tracking which method cleared a document:
-- 'ai' (vision model scan) or 'manual' (self-review against the
-- example + checklist, no file ever leaves the browser).
--
-- DPDP Act compliance — data minimization. Manual verification never
-- touches Supabase Storage: no file is uploaded, so there is nothing
-- to delete. Only the verification_method flag + checked_at timestamp
-- are written to the existing documents row.
-- ───────────────────────────────────────────────────────────────────────

alter table public.documents
  add column if not exists verification_method text
  check (verification_method in ('ai', 'manual'));

comment on column public.documents.verification_method is
  'How this document was cleared: ai (vision-model scan) or manual (self-review, no upload). Null for rows created before this feature.';
