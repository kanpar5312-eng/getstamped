# Gap #2 Scope: Refusal / 214(b) Handling

## What's already there

214(b) is well covered as *prevention* content — it appears 13+ times across
`lib/steps.ts`, mostly in interview-prep steps explaining what it is, why
officers cite it, and how to build ties-to-home evidence to avoid it. This
part doesn't need more depth.

## What's actually missing (confirmed, not assumed)

Step 41 ("Attend visa interview," Phase 5) is the only place a denial is
addressed at all, and the entire guidance is: *"DENIED: officer hands back
passport with a section (usually 214(b)). Accept calmly."* Common mistake #4
on the same step: *"Arguing if denied — accept calmly and exit."*

That's it. There is no next step, no linked content, no flow for what a
denied applicant does the next day, next week, or next cycle. A student who
gets refused hits a dead end in the product at the exact moment they need it
most. This is the sharpest, most concrete gap on your whole list — worth
treating as higher priority than the ranking implies, because the current
product actively fails this user rather than just lacking a nice-to-have.

There's also no `prior_refusal` field anywhere in the schema — confirmed via
grep across `supabase/migrations` and `lib/`. Gap #3 (prior-refusal flag)
isn't just unbuilt, it's not planned for; nothing in the data model
anticipates it.

## Proposed scope

### Phase A — New Phase 5 step: "If you're refused"
- Insert a new step immediately after Step 41 (or split Step 41 into
  "attend interview" + "handle a 214(b) refusal") using the existing `Step`
  type shape in `lib/steps.ts` — this is the cheapest possible way to ship
  something real fast, since the content/rendering pipeline already exists.
- Content: what 214(b) actually means procedurally (no formal "ban," you can
  reapply immediately, but reapplying without a material change in your
  evidence just repeats the same denial), what changed-circumstances
  evidence actually moves the needle (new job offer, new financial
  documentation, changed ties), and a realistic timeline (some consulates
  have unofficial cooling-off norms — needs country-specific research, don't
  guess).

### Phase B — Prior-refusal flag + branching
- Add `prior_refusal: boolean` + `prior_refusal_reason: text` to `profiles`
  (new migration, following the pattern of `0002_country_aware.sql` /
  `0010_promo_codes.sql`).
- Capture at onboarding or re-onboarding after a denial event.
- Branch interview-prep content: a prior-refusal applicant needs the officer
  to see what's *different* this time, which means the mock interview and
  ties-to-home steps need refusal-aware variants, not the generic version.

### Phase C — Reapply flow
- A dedicated mini-flow (could live at `app/dashboard/reapply` or as a
  branch inside the existing dashboard): diagnose likely denial reason from
  what the officer cited (214(b) intent vs. financial insufficiency vs.
  221(g) unresolved), checklist of what to fix, revised DS-160 guidance,
  updated financial/ties documentation checklist.
- Feed this from the same `resolveStepContent` + country-aware pattern
  already used elsewhere — don't build a parallel content system.

### Phase D — Mock interview refusal-aware mode
- `app/api/mock-interview/finish/route.ts` already computes a verdict
  (ready/almost_ready/needs_work). For a flagged prior-refusal user, the
  prompt should explicitly probe whether the answer addresses what likely
  got them denied last time, not just general readiness.

## One thing to fix regardless of this gap

Separate from scope, but found while reading this code: `finish/route.ts`
sends push copy *"Officer-ready. Save this score and walk in."* on a "ready"
verdict. That's a judgment on a specific applicant's approval odds, not a
formatting/readiness check — this is the exact category CLAUDE.md flagged as
needing a legal audit (doc "verdict" and mock interview "Officer-ready"
score). Recommend softening to something like "Prep complete — this is a
strong practice score" before any of gap #2's work adds more verdict-style
copy on top of it. Same file also uses `ai_verdict` as a field name; the
field itself is fine internally, the user-facing string is the actual risk.

## Sequencing note

Phase A can ship in a day — it's content, not infrastructure, and the
pipeline exists. Phases B-D depend on real user volume to be worth building
(a branching reapply flow for zero users is premature). This is the same
point from the outreach/scoping tension: ship Phase A now, gate B-D on
whether outreach feedback actually surfaces refused applicants as a
meaningful segment.
