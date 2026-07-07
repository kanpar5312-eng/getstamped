-- ════════════════════════════════════════════════════════════════════════
-- 0013_prior_refusal.sql
-- ──────────────────────────────────────────────────────────────────────
-- Adds a prior-visa-refusal flag to profiles. Feeds two things once this
-- migration has run and been picked up by app code:
--   - the mock interview grading prompt (app/api/mock-interview/finish/
--     route.ts) weights whether an answer addresses what likely changed
--     since a prior refusal, instead of grading generically
--   - Settings > Application surfaces an optional field so a returning
--     applicant can flag this after the fact, not just at signup
--
-- Nullable / defaulted so existing rows are unaffected. All app-side
-- reads/writes to these columns are wrapped in try/catch (see
-- lib/prior-refusal.ts, app/actions/prior-refusal.ts) and fail soft if
-- this migration hasn't been applied yet — same pattern as
-- lib/recompute-readiness.ts for the compute_readiness Edge Function.
-- ════════════════════════════════════════════════════════════════════════

alter table public.profiles
  add column if not exists prior_refusal boolean not null default false,
  add column if not exists prior_refusal_reason text,   -- free text: '214b' | 'financial' | '221g_unresolved' | 'other' | user's own words
  add column if not exists prior_refusal_date date,
  add column if not exists prior_refusal_count int not null default 0;
