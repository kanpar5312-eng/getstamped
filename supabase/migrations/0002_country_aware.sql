-- =====================================================================
-- GetStamped — Country-aware visa system (migration 0002)
-- Idempotent: safe to re-run in the Supabase SQL editor.
-- =====================================================================
-- Adds five reference tables (visa_countries, visa_steps,
-- visa_documents, visa_interview_questions) plus one per-user
-- selection table (user_country_selection). Relaxes the
-- step_progress.step_number range so UK/CA/AU/DE flows can
-- use their own numbering, and adds a country_code column so
-- progress is keyed per (user, country, step).
-- ---------------------------------------------------------------------

create extension if not exists "pgcrypto";

-- =====================================================================
-- visa_countries : the 5 destinations we currently support
-- =====================================================================
create table if not exists public.visa_countries (
  id                      uuid primary key default gen_random_uuid(),
  code                    text unique not null,        -- 'US','UK','CA','AU','DE'
  name                    text not null,               -- "United States"
  visa_type               text not null,               -- "F-1", "Student Visa (Tier 4)", ...
  flag_emoji              text,
  processing_time_weeks   int,
  -- TODO(verify-before-launch): official portal URLs change. Re-check yearly.
  official_portal_url     text,
  currency_code           text,                        -- 'USD','GBP','CAD','AUD','EUR'
  is_active               boolean not null default true,
  created_at              timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Bootstrap the 5 country rows IMMEDIATELY so the FK on step_progress
-- (added below) can validate against an existing 'US' default value.
-- The full seed-countries.sql will UPSERT these rows later — harmless.
-- ---------------------------------------------------------------------
insert into public.visa_countries (code, name, visa_type, flag_emoji, processing_time_weeks, official_portal_url, currency_code)
values
  ('US', 'United States',   'F-1 Student Visa',           '🇺🇸',  4, 'https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html', 'USD'),
  ('UK', 'United Kingdom',  'Student Visa (Tier 4)',      '🇬🇧',  3, 'https://www.gov.uk/student-visa',                                              'GBP'),
  ('CA', 'Canada',          'Study Permit',               '🇨🇦', 10, 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html', 'CAD'),
  ('AU', 'Australia',       'Student Visa (Subclass 500)','🇦🇺',  6, 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500', 'AUD'),
  ('DE', 'Germany',         'Student Visa (§16b)',        '🇩🇪',  8, 'https://www.auswaertiges-amt.de/en/visa-service/-/231148',                       'EUR')
on conflict (code) do nothing;

-- =====================================================================
-- visa_steps : the playbook for each country
-- =====================================================================
create table if not exists public.visa_steps (
  id                    uuid primary key default gen_random_uuid(),
  country_code          text not null references public.visa_countries(code) on delete cascade,
  step_number           int not null,
  phase                 int not null check (phase between 1 and 5),
  phase_name            text not null,
  title                 text not null,
  description           text not null,
  what_to_upload        text,
  deadline_offset_days  int,
  is_free_tier          boolean not null default false,
  created_at            timestamptz not null default now(),
  unique (country_code, step_number)
);
create index if not exists visa_steps_country_phase_idx
  on public.visa_steps (country_code, phase, step_number);

-- =====================================================================
-- visa_documents : the document checklist per country
-- =====================================================================
create table if not exists public.visa_documents (
  id                    uuid primary key default gen_random_uuid(),
  country_code          text not null references public.visa_countries(code) on delete cascade,
  document_key          text not null,
  display_name          text not null,
  description           text not null,
  is_mandatory          boolean not null default true,
  ai_review_rules       jsonb,
  common_mistakes       text[],
  -- TODO(verify-before-launch): government source URLs change. Re-check yearly.
  official_source_url   text,
  created_at            timestamptz not null default now(),
  unique (country_code, document_key)
);
create index if not exists visa_documents_country_idx
  on public.visa_documents (country_code, is_mandatory desc);

-- =====================================================================
-- visa_interview_questions : per-country question bank
-- =====================================================================
create table if not exists public.visa_interview_questions (
  id                    uuid primary key default gen_random_uuid(),
  country_code          text not null references public.visa_countries(code) on delete cascade,
  question_text         text not null,
  category              text not null check (category in (
    'study_plan','finances','ties_to_home',
    'university_choice','post_study_plans','english_proficiency'
  )),
  difficulty            text check (difficulty in ('easy','medium','hard')),
  why_asked             text,
  good_answer_signals   text[],
  red_flag_signals      text[],
  created_at            timestamptz not null default now()
);
create index if not exists visa_questions_country_idx
  on public.visa_interview_questions (country_code, category);

-- =====================================================================
-- user_country_selection : one row per user, their destination
-- =====================================================================
create table if not exists public.user_country_selection (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null unique references auth.users(id) on delete cascade,
  country_code             text not null references public.visa_countries(code),
  applying_from_country    text,                       -- ISO-2 of home country (UI hint only)
  selected_at              timestamptz not null default now(),
  visa_appointment_date    date,
  university_name          text,
  created_at               timestamptz not null default now()
);

-- =====================================================================
-- step_progress: relax the hard-coded 1..47 range and key by country
-- ---------------------------------------------------------------------
-- We wrap the existing F-1 logic: pre-existing rows are interpreted as
-- country_code = 'US'. Future non-US progress lives alongside it.
-- =====================================================================
alter table public.step_progress
  add column if not exists country_code text not null default 'US'
  references public.visa_countries(code);

-- Drop the legacy 1..47 check if (and only if) we can find it. Wrapping the
-- name lookup in a declared variable avoids "EXECUTE null" (SQLSTATE 22004)
-- when the constraint already isn't there.
do $$
declare
  v_conname text;
begin
  select conname into v_conname
  from pg_constraint
  where conrelid = 'public.step_progress'::regclass
    and contype  = 'c'
    and (
      pg_get_constraintdef(oid) ilike '%step_number%47%'
      or pg_get_constraintdef(oid) ilike '%between 1 and 47%'
    )
  limit 1;

  if v_conname is not null then
    execute 'alter table public.step_progress drop constraint ' || quote_ident(v_conname);
  end if;
end$$;

alter table public.step_progress
  drop constraint if exists step_progress_user_id_step_number_key;

-- Wide range check (idempotent — add only if not already present).
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.step_progress'::regclass
      and conname  = 'step_progress_step_number_range'
  ) then
    alter table public.step_progress
      add constraint step_progress_step_number_range
      check (step_number between 1 and 60);
  end if;
end$$;

-- Composite uniqueness (idempotent).
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.step_progress'::regclass
      and conname  = 'step_progress_user_country_step_unique'
  ) then
    alter table public.step_progress
      add constraint step_progress_user_country_step_unique
      unique (user_id, country_code, step_number);
  end if;
end$$;

create index if not exists step_progress_user_country_idx
  on public.step_progress (user_id, country_code);

-- =====================================================================
-- RLS — reference tables are public-read; user table is per-user
-- =====================================================================
alter table public.visa_countries            enable row level security;
alter table public.visa_steps                enable row level security;
alter table public.visa_documents            enable row level security;
alter table public.visa_interview_questions  enable row level security;
alter table public.user_country_selection    enable row level security;

drop policy if exists visa_countries_read on public.visa_countries;
create policy visa_countries_read on public.visa_countries
  for select using (true);

drop policy if exists visa_steps_read on public.visa_steps;
create policy visa_steps_read on public.visa_steps
  for select using (true);

drop policy if exists visa_documents_read on public.visa_documents;
create policy visa_documents_read on public.visa_documents
  for select using (true);

drop policy if exists visa_questions_read on public.visa_interview_questions;
create policy visa_questions_read on public.visa_interview_questions
  for select using (true);

drop policy if exists user_country_selection_self on public.user_country_selection;
create policy user_country_selection_self on public.user_country_selection
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =====================================================================
-- Grants — anon/authenticated can SELECT reference tables
-- =====================================================================
grant select on public.visa_countries           to anon, authenticated;
grant select on public.visa_steps               to anon, authenticated;
grant select on public.visa_documents           to anon, authenticated;
grant select on public.visa_interview_questions to anon, authenticated;
grant select, insert, update, delete
  on public.user_country_selection              to authenticated;
