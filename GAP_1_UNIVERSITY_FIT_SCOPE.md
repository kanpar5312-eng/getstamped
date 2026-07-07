# Gap #1 Scope: University/Course Fit Guidance

## Correction to the starting premise

"Nothing exists before I-20" is not accurate. `lib/steps.ts` Step 1 ("Choose
universities matching your profile," Phase 1, 480 estimated minutes) already
covers: SEVP certification verification, a reach/target/safety 3-tier
shortlist method, per-program STEM OPT eligibility, I-20 processing-time
variance by school, and mapping schools to consulates. It's solid static
content — not a blank slate.

The real gap is narrower than "build fit guidance from zero": the existing
step is *instructional prose*, not a *tool*. It tells a student how to build
a shortlist manually. It doesn't take their profile and give them one. Scope
accordingly — this is a personalization/interactivity layer on existing good
content, not a new content vertical.

## What's actually missing

1. **No input capture.** There's no field anywhere (onboarding or step 1)
   that captures GPA/scores, budget, intended major, target degree level, or
   home country in a structured way that a fit engine could use. Onboarding
   currently captures country + F-1 status, not academic profile.
2. **No course-level (major) fit.** Step 1 handles STEM OPT flag at the
   program level, but there's no guidance on matching a specific major to
   career outcomes, or comparing two programs at the same school.
3. **No named-school comparison.** Nothing lets a student compare 2-3 actual
   schools side by side on cost, STEM status, I-20 speed, or consulate
   interview patterns for their home country.
4. **No ROI/outcome framing.** No cost-vs-post-grad-earnings context, which
   is one of the most Reddit-requested angles for this exact audience
   (r/f1visa regularly has "is this program worth $60k" threads).

## Proposed scope (in priority order)

### Phase A — Structured profile capture (small, unblocks everything else)
- Add academic-profile fields to onboarding or a new pre-Step-1 mini-form:
  target degree level, intended field/major, budget ceiling, test scores
  (optional), home country (already captured).
- Store in `profiles` table (extend, don't create a new table — check
  existing `profiles` schema before adding columns).

### Phase B — Interactive shortlist builder
- New component under `app/dashboard/onboarding` or a new
  `app/dashboard/university-fit` route.
- Input: profile from Phase A. Output: a generated reach/target/safety
  shortlist using a static ranked dataset (do NOT call an LLM to invent
  school data — hallucination risk is high and this is exactly the kind of
  claim that needs to be factually solid, not generated).
- Data source decision needed before building: license/scrape a real
  dataset (IPEDS, College Scorecard API — both free, US government) vs.
  hand-curate a smaller list of ~200 popular F-1 destination schools. IPEDS/
  College Scorecard is the more defensible choice for cost, STEM CIP codes,
  and outcomes data — recommend starting there.

### Phase C — Program/major-level fit
- Layer STEM OPT + estimated post-grad salary (College Scorecard has this
  per-program) into the comparison view.
- Explicit "why this program" copy generator for the DS-160/interview
  answer, reusing the existing `resolveStepContent` pattern.

### Phase D — Named-school comparison view
- Side-by-side 2-3 school comparison card: cost, STEM status, I-20 speed
  (crowdsourced or estimated), consulate mapping.
- This is the piece most likely to need real user data to be accurate (I-20
  speed varies by school and isn't in any public dataset) — flag as
  something to backfill from actual user reports over time, not launch-day
  complete.

## Before writing any code

Do not start Phase B until Phase A's data source decision is made — that
decision (real government dataset vs. hand-curated list vs. LLM-generated)
determines the entire data model and is expensive to reverse. Also: this is
exactly the kind of feature outreach feedback (email/Reddit tasks) should
validate before full build — if DSOs/consultants say "the existing static
guidance is enough, the actual gap is elsewhere," Phase B-D get deprioritized
without anyone having built them for nothing.
