-- ════════════════════════════════════════════════════════════════════════
-- 0011_family_seats
-- Real multi-seat support for the Family plan.
--
-- Before this migration, "family" was just a value in profiles.plan on a
-- single account — the "2 student seats" / "6 mock interviews each"
-- marketing claims had no backing data model. This adds one.
--
--   family_groups   — one row per Family purchase. owner_user_id is the
--                      account that bought the plan.
--   profiles.family_group_id — set on both the owner and every accepted
--                      member, so all seat-holders point at the same group.
--   family_invites  — email-addressed, single-use invite links (mirrors
--                      the referrals table's shape/RLS posture).
--
-- Flow:
--   1. Owner (profiles.plan = 'family') opens Settings → Family, enters an
--      email. inviteFamilyMember() creates a family_groups row on first
--      use, then a family_invites row with a random token, and emails
--      /family/join/<token>.
--   2. Recipient clicks the link. If signed in, joinFamilyByToken() runs
--      immediately. If not, a cookie holds the token through sign-up and
--      the signUp action calls attachFamilyInviteFromCookie() right after
--      account creation (same pattern as referral attribution).
--   3. Joining sets the new member's profile.plan = 'family' and
--      profiles.family_group_id = the group id. Mock-interview quota
--      (lib/checkLimit.ts) is metered per account, so two real seats now
--      naturally get 6/week each — no more "combined 12" workaround.
--
-- Locked down like promo_codes: no direct client access at all. Every
-- read/write goes through server actions using the service-role client.
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.family_groups (
  id            uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  max_seats     int  not null default 2 check (max_seats > 0),
  created_at    timestamptz not null default now()
);

-- One family group per owner — re-inviting reuses the existing group.
create unique index if not exists family_groups_owner_uidx
  on public.family_groups (owner_user_id);

alter table public.profiles
  add column if not exists family_group_id uuid references public.family_groups(id) on delete set null;

create index if not exists profiles_family_group_idx
  on public.profiles (family_group_id)
  where family_group_id is not null;

create table if not exists public.family_invites (
  id               uuid primary key default gen_random_uuid(),
  family_group_id  uuid not null references public.family_groups(id) on delete cascade,
  email            text not null,
  token            text not null,
  status           text not null default 'pending' check (status in ('pending', 'accepted', 'revoked')),
  created_at       timestamptz not null default now(),
  accepted_at      timestamptz,
  accepted_user_id uuid references public.profiles(id) on delete set null
);

create unique index if not exists family_invites_token_uidx on public.family_invites (token);
create index if not exists family_invites_group_idx on public.family_invites (family_group_id, status);

-- ---- RLS ----
-- No direct client access, same posture as promo_codes — every read/write
-- goes through server actions using the service-role client, which
-- bypasses RLS entirely. This avoids members being able to enumerate each
-- other's invites or emails via the anon/authenticated Supabase client.
alter table public.family_groups enable row level security;
alter table public.family_invites enable row level security;
revoke all on public.family_groups from anon, authenticated;
revoke all on public.family_invites from anon, authenticated;

-- ────────────────────────────────────────────────────────────────────
-- Atomic accept — mirrors redeem_promo_code's race-safety. Two people
-- can't both consume the same single-use invite token, and a group's
-- seats can't be oversold past max_seats.
-- Returns the family_group_id on success, NULL if the invite is invalid,
-- already used, or the group is already full.
-- ────────────────────────────────────────────────────────────────────
create or replace function public.accept_family_invite(p_token text, p_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group_id uuid;
  v_max_seats int;
  v_current_seats int;
begin
  select family_group_id into v_group_id
    from public.family_invites
   where token = p_token
     and status = 'pending';

  if v_group_id is null then
    return null;
  end if;

  select max_seats into v_max_seats
    from public.family_groups
   where id = v_group_id;

  select count(*) into v_current_seats
    from public.profiles
   where family_group_id = v_group_id;

  if v_current_seats >= v_max_seats then
    return null;
  end if;

  update public.family_invites
     set status = 'accepted',
         accepted_at = now(),
         accepted_user_id = p_user_id
   where token = p_token
     and status = 'pending';

  if not found then
    -- Someone else accepted it between the select above and here.
    return null;
  end if;

  update public.profiles
     set family_group_id = v_group_id,
         plan = 'family'
   where id = p_user_id;

  return v_group_id;
end $$;

revoke all on function public.accept_family_invite(text, uuid) from public;
grant execute on function public.accept_family_invite(text, uuid) to authenticated;
