-- ════════════════════════════════════════════════════════════════════════
-- 0010_promo_codes.sql
-- ──────────────────────────────────────────────────────────────────────
-- Promo codes — single-use-per-quota gate for free upgrades to a paid
-- plan. The application calls a SECURITY DEFINER function (redeem_promo_
-- code) which atomically checks + increments uses_so_far so two users
-- redeeming the last slot at once can't both succeed.
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.promo_codes (
  code            text primary key,
  plan_override   text not null check (plan_override in ('solo','family')),
  max_uses        int  not null check (max_uses > 0),
  uses_so_far     int  not null default 0 check (uses_so_far >= 0),
  active          boolean not null default true,
  created_at      timestamptz not null default now()
);

create index if not exists promo_codes_active_idx
  on public.promo_codes (active) where active = true;

-- RLS: never let the client read or write directly. Reads happen via the
-- redeem function (security definer), writes happen via the SQL editor.
alter table public.promo_codes enable row level security;
revoke all on public.promo_codes from anon, authenticated;

-- ────────────────────────────────────────────────────────────────────
-- Atomic redeem. Returns the plan_override if redemption succeeded.
-- Returns NULL if the code is unknown, inactive, or fully redeemed.
-- The single UPDATE with the guard predicates is the race-safe move:
-- two callers can't both pass the uses_so_far < max_uses check.
-- ────────────────────────────────────────────────────────────────────
create or replace function public.redeem_promo_code(p_code text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan text;
begin
  update public.promo_codes
     set uses_so_far = uses_so_far + 1
   where lower(code) = lower(p_code)
     and active = true
     and uses_so_far < max_uses
  returning plan_override into v_plan;
  return v_plan;  -- null if no row matched
end $$;

revoke all on function public.redeem_promo_code(text) from public;
grant execute on function public.redeem_promo_code(text) to authenticated;
