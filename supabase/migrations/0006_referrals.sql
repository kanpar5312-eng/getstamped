-- ════════════════════════════════════════════════════════════════════════
-- 0006_referrals
-- Two-sided referral program.
--   - profiles.referral_code      → unique, ~7-char share code
--   - profiles.referral_credit_*  → balance accrued from completed referrals
--   - referrals                   → one row per (referrer, referee) link
--
-- Flow:
--   1. /r/<code> sets a gs_ref cookie and bounces to /sign-up.
--   2. signUp action reads the cookie, looks up the referrer by code,
--      inserts a `pending` row.
--   3. When the referee pays (future checkout webhook), call
--      lib/referrals.markReferralCompleted(refereeUserId):
--        - flip status to 'completed', reward_applied=true
--        - bump referrer's credit balance by ₹500 / $8
--        - fire the "You earned a reward" email
-- ════════════════════════════════════════════════════════════════════════

-- ---- profiles columns ----
alter table public.profiles
  add column if not exists referral_code              text,
  add column if not exists referral_credit_inr_paise  bigint not null default 0,
  add column if not exists referral_credit_usd_cents  bigint not null default 0;

create unique index if not exists profiles_referral_code_uidx
  on public.profiles (referral_code)
  where referral_code is not null;

-- ---- referrals table ----
create table if not exists public.referrals (
  id                uuid primary key default gen_random_uuid(),
  referrer_user_id  uuid not null references auth.users(id) on delete cascade,
  referee_user_id   uuid not null references auth.users(id) on delete cascade,
  code              text not null,
  status            text not null default 'pending' check (status in ('pending', 'completed', 'cancelled')),
  reward_applied    boolean not null default false,
  created_at        timestamptz not null default now(),
  completed_at      timestamptz,
  -- A referee can only be attributed to one referrer, ever.
  unique (referee_user_id),
  -- No self-referrals.
  check (referrer_user_id <> referee_user_id)
);

create index if not exists referrals_referrer_idx on public.referrals (referrer_user_id, status);
create index if not exists referrals_code_idx     on public.referrals (code);

-- ---- RLS ----
-- Users see referrals where they are the referrer (so the settings page
-- can show "n friends referred"). They never see who referred them — that
-- data is for admin reporting only.
alter table public.referrals enable row level security;

drop policy if exists referrals_read_own on public.referrals;
create policy referrals_read_own on public.referrals
  for select using (auth.uid() = referrer_user_id);

-- Inserts + updates are service-role only (sign-up action + webhook).
revoke insert, update, delete on public.referrals from anon, authenticated;
grant  select               on public.referrals to authenticated;
