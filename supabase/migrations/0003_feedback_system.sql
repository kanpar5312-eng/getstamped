-- =====================================================================
-- GetStamped — Feedback / readiness system (migration 0003)
-- Idempotent: safe to re-run.
-- ---------------------------------------------------------------------
-- Adds richer interview sessions/answers, per-doc AI review history,
-- and readiness snapshots. Coexists with the legacy
-- `mock_interview_sessions` and `documents` tables — those keep working
-- as the source of truth for raw upload/transcript history. The new
-- tables capture the *scored* layer that the Feedback page reads from.
-- =====================================================================

create extension if not exists "pgcrypto";

-- =====================================================================
-- interview_sessions : scored mock interview sittings
-- =====================================================================
create table if not exists public.interview_sessions (
  id                            uuid primary key default gen_random_uuid(),
  user_id                       uuid not null references auth.users(id) on delete cascade,
  country_code                  text not null default 'US' references public.visa_countries(code),
  started_at                    timestamptz not null default now(),
  completed_at                  timestamptz,
  total_questions               int,
  questions_answered            int,
  overall_score                 int check (overall_score between 0 and 100),
  study_plan_score              int check (study_plan_score between 0 and 100),
  financial_credibility_score   int check (financial_credibility_score between 0 and 100),
  ties_to_home_score            int check (ties_to_home_score between 0 and 100),
  confidence_score              int check (confidence_score between 0 and 100),
  ai_summary                    text,
  ai_verdict                    text check (ai_verdict in ('ready','almost_ready','needs_work')),
  created_at                    timestamptz not null default now()
);
create index if not exists interview_sessions_user_idx
  on public.interview_sessions (user_id, created_at desc);

-- =====================================================================
-- interview_answers : per-question scoring + transcript
-- =====================================================================
create table if not exists public.interview_answers (
  id                    uuid primary key default gen_random_uuid(),
  session_id            uuid not null references public.interview_sessions(id) on delete cascade,
  question_id           uuid references public.visa_interview_questions(id),
  question_text         text not null,
  answer_transcript     text,
  score                 int check (score between 0 and 100),
  category              text check (category in (
    'study_plan','finances','ties_to_home',
    'university_choice','post_study_plans','english_proficiency'
  )),
  ai_feedback           text,
  red_flags_triggered   text[] default '{}',
  strong_signals        text[] default '{}',
  created_at            timestamptz not null default now()
);
create index if not exists interview_answers_session_idx
  on public.interview_answers (session_id, created_at);

-- =====================================================================
-- document_review_results : per-document AI review history
-- =====================================================================
create table if not exists public.document_review_results (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references auth.users(id) on delete cascade,
  country_code            text references public.visa_countries(code),
  document_key            text not null,
  document_display_name   text not null,
  reviewed_at             timestamptz not null default now(),
  passed                  boolean not null,
  issues                  text[] default '{}',
  suggestions             text[] default '{}',
  ai_confidence           int check (ai_confidence between 0 and 100),
  file_url                text,
  created_at              timestamptz not null default now()
);
create index if not exists doc_review_user_idx
  on public.document_review_results (user_id, reviewed_at desc);
create index if not exists doc_review_user_key_idx
  on public.document_review_results (user_id, document_key);

-- =====================================================================
-- preparation_snapshots : computed readiness over time
-- ---------------------------------------------------------------------
-- The Edge Function (compute_readiness) upserts here. The Feedback page
-- reads the latest row per user; analytics can read the history.
-- =====================================================================
create table if not exists public.preparation_snapshots (
  id                          uuid primary key default gen_random_uuid(),
  user_id                     uuid not null references auth.users(id) on delete cascade,
  snapshot_at                 timestamptz not null default now(),
  steps_completed             int not null default 0,
  steps_total                 int not null default 0,
  documents_passed            int not null default 0,
  documents_total             int not null default 0,
  best_interview_score        int check (best_interview_score between 0 and 100),
  interview_sessions_count    int not null default 0,
  overall_readiness_score     int not null default 0 check (overall_readiness_score between 0 and 100),
  readiness_label             text not null check (readiness_label in (
    'not_started','early','in_progress','almost_ready','ready'
  )),
  created_at                  timestamptz not null default now()
);
create index if not exists prep_snap_user_idx
  on public.preparation_snapshots (user_id, snapshot_at desc);

-- =====================================================================
-- RLS — every table is per-user write + read; parent share reads via a
-- separately-scoped server query that never selects raw fields.
-- =====================================================================
alter table public.interview_sessions       enable row level security;
alter table public.interview_answers        enable row level security;
alter table public.document_review_results  enable row level security;
alter table public.preparation_snapshots    enable row level security;

drop policy if exists interview_sessions_self on public.interview_sessions;
create policy interview_sessions_self on public.interview_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists interview_answers_self on public.interview_answers;
create policy interview_answers_self on public.interview_answers
  for all using (
    exists (
      select 1 from public.interview_sessions s
      where s.id = interview_answers.session_id and s.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.interview_sessions s
      where s.id = interview_answers.session_id and s.user_id = auth.uid()
    )
  );

drop policy if exists document_review_results_self on public.document_review_results;
create policy document_review_results_self on public.document_review_results
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists preparation_snapshots_self on public.preparation_snapshots;
create policy preparation_snapshots_self on public.preparation_snapshots
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update, delete
  on public.interview_sessions, public.interview_answers,
     public.document_review_results, public.preparation_snapshots
  to authenticated;
