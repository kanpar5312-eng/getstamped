# GetStamped — Launch Checklist

Built up over the country-aware visa system + Feedback page work.
Status as of the last commit; read top-down.

---

## 1. ☐ Deploy the `compute_readiness` Edge Function

**Why blocking:** until this runs, `preparation_snapshots` is empty.
Parent view shows 0/100, Feedback page falls back to live counts every
refresh (works, but no history).

**You have to do this — Supabase auth is gated to your machine.**

```bash
brew install supabase/tap/supabase                       # one-time
cd /Users/parneetsinghsandhu/Desktop/visaapp
supabase login                                            # opens browser, click Authorize
supabase link --project-ref <YOUR_REF>                    # asks for DB password
supabase functions deploy compute_readiness
```

Your Reference ID: Supabase dashboard → Project Settings → General → "Reference ID" (20-char lowercase string).

Verify in Supabase dashboard → Edge Functions → `compute_readiness` shows **Active**.

---

## 2. ✅ Writes to the new tables — DONE

I wired these while you were away:

| Trigger | Site | What it writes |
| --- | --- | --- |
| Step toggled to "complete" | `app/actions/step-progress.ts` | (legacy `step_progress` row stays) + calls `recomputeReadiness()` |
| Document AI check finishes | `app/api/documents/check/route.ts` | New row in `document_review_results` + `recomputeReadiness()` |
| Mock interview finish (paid plan only) | `app/api/mock-interview/finish/route.ts` | New row in `interview_sessions` + `interview_answers` (one per turn) + `recomputeReadiness()` |

The `recomputeReadiness()` helper in `lib/recompute-readiness.ts` is safe to call before #1 is deployed — it logs a warning and returns `{ ok: false }` silently. Once you deploy, snapshots start writing automatically.

**TODO post-launch:** the mock interview's per-category scores
(`study_plan_score`, `financial_credibility_score`, `ties_to_home_score`)
are currently *derived* from the legacy three-axis scorecard via
proxies. A clean fix is to update the `computeOverall` prompt in
`finish/route.ts` to grade by category directly. Marker is in the file.

---

## 3. ☐ Verify volatile numbers (research, not coding)

Every fee / threshold / URL has a `TODO(verify-before-launch: 2026-06-17)`
comment near it. Go to each official source and confirm the number, then
remove the TODO.

### Government fees

| Country | Item | Value in code | Verify at |
| --- | --- | --- | --- |
| US | SEVIS I-901 fee | $350 | https://www.fmjfee.com/ |
| US | DS-160 MRV fee | $185 | https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/fees/fees-visa-services.html |
| UK | IHS surcharge | £776/year | https://www.gov.uk/healthcare-immigration-application |
| UK | Visa fee | £524 | https://www.gov.uk/student-visa |
| Canada | Study permit fee | CAD $150 | https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/apply.html |
| Canada | Biometrics fee | CAD $85 | same |
| Australia | Subclass 500 fee | AUD $1,600 | https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500 |
| Germany | Visa fee | €75 | https://www.auswaertiges-amt.de/en/visa-service |

### Financial thresholds

| Country | Threshold | Value in code | Verify at |
| --- | --- | --- | --- |
| UK | Maintenance — London | £1,334/month | https://www.gov.uk/student-visa/money |
| UK | Maintenance — non-London | £1,023/month | same |
| Canada | Living costs (1 student, outside Quebec) | CAD $20,635/yr | https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/get-documents.html |
| Canada | + per dependent | CAD $4,000/yr | same |
| Australia | Living costs | AUD $29,710/yr | https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500/genuine-temporary-entrant |
| Australia | + partner | AUD $10,394/yr | same |
| Australia | + child | AUD $4,449/yr | same |
| Germany | Blocked account (Sperrkonto) | €11,208/yr | https://www.auswaertiges-amt.de/en/visa-service/-/231148 |

### Processing-time-weeks (in `visa_countries` table + `lib/visa-countries.ts`)

| Country | Code value | Sanity check |
| --- | --- | --- |
| US | 4 weeks | Highly variable by post. Mumbai/Delhi summers can be 12+. |
| UK | 3 weeks | Standard. Priority/super-priority paid options exist. |
| Canada | 10 weeks | Volatile — SDS faster (~4 wk). |
| Australia | 6 weeks | Median. Worst case 12. |
| Germany | 8 weeks | Embassy-dependent — Tehran/Istanbul slower. |

### Currency price points (`lib/pricing.ts`)

The GBP / CAD / AUD / EUR Solo + Family prices are stub conversions from the USD anchor. Before non-US launch, replace with **researched local-purchasing-power anchors** plus a competitor scan. The INR and USD anchors are already correct.

### Official portal URLs

In `supabase/seed-countries.sql` and `lib/visa-countries.ts`. URLs do shift — re-check each one.

### UK TB-test required country set

In `lib/visa-countries.ts` (`UK_TB_TEST_REQUIRED`). UK adds/removes countries periodically. Cross-check against https://www.gov.uk/tb-test-visa.

---

## 4. ☐ Deploy to Vercel (you do this when ready)

1. Push the repo to GitHub — **done** (`https://github.com/kanpar5312-eng/getstamped`)
2. Vercel → Add New → Project → Import this repo.
3. Build settings auto-detect (Next.js).
4. Environment Variables — add all of these in the Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GROQ_API_KEY`
   - `RESEND_API_KEY`
   - (Optional) `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`
5. Deploy.
6. Point your domain — `getstamped.app`?

---

## 5. ☐ Pre-launch polish (nice-to-have, not blocking)

- [ ] Replace fictional testimonials in `components/landing/v3/Reviews.tsx`
- [ ] Mobile QA pass — Feedback page, TourPlayer, Parent overview at 390px
- [ ] Wire `PhaseStepper`, `DocumentsClient`, `MockInterviewClient` to use `lib/visa-data.ts` for non-US users (currently those surfaces are F-1-only)
- [ ] Add `Co-Authored-By` boilerplate if you want to credit the AI in commit messages going forward
- [ ] Set up Vercel Analytics or Plausible to measure the funnel
- [ ] Add a real `getstamped.app` domain if you don't have one yet
- [ ] Privacy policy + terms of service if not yet wired (check `app/legal/`)

---

## 6. ☐ Post-launch (week 1 watch list)

- [ ] Monitor `[recomputeReadiness] edge function not available` warnings in Vercel logs — should be zero once #1 is done
- [ ] Monitor `[priority-actions] groq returned non-JSON` warnings — if these climb, the JSON-schema enforcement is loose
- [ ] Watch the conversion funnel: hero → signup → onboarding complete → first mock interview → first paid plan
- [ ] Collect 6+ real testimonials and swap them into the marketing page

---

## Quick "what's still missing" by component

| Component | Status |
| --- | --- |
| Marketing landing | ✅ |
| Onboarding (7 steps + curtain) | ✅ |
| Dashboard nav + country pill | ✅ |
| Feedback page | ✅ (reads from new tables once Edge Function deploys) |
| Document Vault | ✅ writes to new table; dashboard UI is still F-1-only |
| Mock Interview | ✅ writes to new table; dashboard UI is still F-1-only |
| Parent share preparation overview | ✅ reads via leak-safe allowlist |
| 60-second tour player | ✅ |
| Ask AI | ✅ |
| Edge Function `compute_readiness` | ⚠ code shipped, deployment pending |
| Step toggle → recompute | ✅ |
| Doc review → recompute | ✅ |
| Mock interview finish → recompute | ✅ |
