-- ════════════════════════════════════════════════════════════════════════
-- 0014_university_fit.sql
-- ──────────────────────────────────────────────────────────────────────
-- Quiz inputs for the university/course fit tool (gap #1, Phase B). Feeds
-- app/api/university-fit/generate/route.ts, which reasons about program
-- tiers and characteristics from these answers — it never asserts live,
-- unverified facts about named schools (deadlines, exact GPA cutoffs),
-- so accuracy risk here is contained to "the reasoning was unhelpful,"
-- not "the reasoning was factually wrong about a specific school."
--
-- All free-text/nullable by design — this is a 2-minute quiz, not a
-- required field, and a partial answer should still be usable.
--
-- Same isolation pattern as 0013_prior_refusal.sql: app-side reads/writes
-- (lib/university-fit.ts, app/actions/university-fit.ts) are wrapped in
-- try/catch and fail soft if this migration hasn't been applied yet.
-- ════════════════════════════════════════════════════════════════════════

alter table public.profiles
  add column if not exists uf_intended_field text,
  add column if not exists uf_target_degree_level text,   -- 'Undergrad' | 'Master's' | 'PhD'
  add column if not exists uf_budget_ceiling_usd int,
  add column if not exists uf_academic_scores text,        -- free text: "3.6 GPA, 320 GRE" etc.
  add column if not exists uf_career_goal text,
  add column if not exists uf_completed_at timestamptz;
