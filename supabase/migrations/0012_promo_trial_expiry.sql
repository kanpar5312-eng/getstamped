-- ════════════════════════════════════════════════════════════════════════
-- 0012_promo_trial_expiry.sql
-- ──────────────────────────────────────────────────────────────────────
-- Promo codes can now grant a time-limited trial instead of a permanent
-- plan upgrade — e.g. BETA10 unlocks Solo for 2 days (not lifetime) and
-- is capped at 30 total redemptions, so a beta cohort can try everything
-- without the AI/token cost of an unlimited free tier.
--
-- trial_days is nullable: NULL means "permanent grant" (existing codes
-- keep working exactly as before). A non-null value means the redeeming
-- profile's plan reverts to 'free' once plan_trial_expires_at passes —
-- enforced in lib/current-user.ts on every read, not just at redemption
-- time, so the downgrade happens the moment the trial actually expires.
-- ════════════════════════════════════════════════════════════════════════

alter table public.promo_codes
  add column if not exists trial_days int check (trial_days is null or trial_days > 0);

alter table public.profiles
  add column if not exists plan_trial_expires_at timestamptz;

-- Redeem function now also returns trial_days so the caller knows whether
-- (and for how long) to set the expiry. Signature change (scalar → table)
-- means the RPC result becomes an array client-side — see
-- app/actions/promo.ts.
drop function if exists public.redeem_promo_code(text);

create or replace function public.redeem_promo_code(p_code text)
returns table(plan_override text, trial_days int)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  update public.promo_codes
     set uses_so_far = uses_so_far + 1
   where lower(promo_codes.code) = lower(p_code)
     and promo_codes.active = true
     and promo_codes.uses_so_far < promo_codes.max_uses
  returning promo_codes.plan_override, promo_codes.trial_days;
end $$;

revoke all on function public.redeem_promo_code(text) from public;
grant execute on function public.redeem_promo_code(text) to authenticated;

-- Seed/update BETA10: Solo-equivalent access, 2-day trial, 30 total uses.
-- Re-running this migration is safe — it just resets BETA10 back to these
-- limits rather than creating a duplicate row.
insert into public.promo_codes (code, plan_override, max_uses, trial_days, active)
values ('BETA10', 'solo', 30, 2, true)
on conflict (code) do update
  set plan_override = excluded.plan_override,
      max_uses       = excluded.max_uses,
      trial_days     = excluded.trial_days,
      active         = true;
