# Gap #3 Scope: Prior-Refusal Flag

This overlaps with gap #2's Phase B but is broken out because it's the
smaller, shippable piece — a data flag plus branching — versus gap #2's
full reapply flow. Build this first; it's the dependency gap #2's Phase B-D
need anyway.

## Confirmed schema gap

`public.profiles` (supabase/schema.sql) has no field for this today:
`first_name, last_name, country, university, intake_term, intake_date,
interview_date, consulate, program_type, funding_source, plan,
visa_stamped, visa_stamped_at, onboarding_completed, created_at,
last_active_at`. Nothing about a prior denial anywhere in the schema or
`lib/`.

## Proposed migration (follows existing pattern, e.g. 0010_promo_codes.sql)

```sql
alter table public.profiles
  add column if not exists prior_refusal boolean not null default false,
  add column if not exists prior_refusal_reason text,   -- '214b' | 'financial' | '221g_unresolved' | 'other'
  add column if not exists prior_refusal_date date,
  add column if not exists prior_refusal_count int not null default 0;
```

Keep `prior_refusal_reason` as free text or a loose check constraint, not a
rigid enum — real refusal letters often cite multiple or ambiguous reasons,
and forcing a single category loses information the reapply flow needs.

## Where to capture it

Two entry points, not one:

1. **Onboarding** — add an optional question ("Have you been refused a visa
   before?") to the existing onboarding flow. Most new signups will answer
   no; keep it low-friction, one yes/no + optional reason picker.
2. **Post-denial re-entry** — a student who used the product, got denied,
   and comes back needs a path to flag this retroactively. This doesn't
   exist yet because Step 41 has no "what now" branch (see gap #2). The
   flag capture and the reapply flow are really one feature split across
   two docs — build them together, not sequentially.

## What consumes the flag (don't build the flag with no consumers)

- Mock interview prompt (`app/api/mock-interview/finish/route.ts` →
  `computeOverall`'s `system` prompt): inject a line when
  `prior_refusal = true` instructing the grading model to weight whether
  the answer addresses what likely changed since the last attempt.
- Interview-prep step content (`lib/steps.ts`, ties-to-home and financial
  steps): conditionally surface a "you've been refused before — here's
  what specifically to change" callout instead of the generic version.
  `resolveStepContent` already exists as the mechanism for
  country-conditional content — extend the same pattern for
  refusal-conditional content rather than building a second system.
- Feedback/parent-view dashboard: a flagged user's readiness snapshot
  should probably show a distinct "second attempt" framing so a parent
  checking the Parent Share link understands the context.

## What NOT to build yet

Don't build a public-facing "refusal rate by reason" analytics view or
anything that aggregates refusal data across users — you have zero users
and no data, and it invites scope creep before the core flag even ships.
That's downstream of gap #9 (outcome feedback loop), not this gap.

## Size estimate

Migration + onboarding question: half a day. Wiring the flag into mock
interview prompt + one step's conditional content: another half day. The
parent-view framing and the rest of gap #2's reapply flow are separate,
larger pieces — don't scope-creep this into a full sprint.
