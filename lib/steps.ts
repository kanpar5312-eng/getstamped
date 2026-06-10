/**
 * /lib/steps.ts — canonical source of truth for the 47-step F-1 process.
 *
 * Each step carries enough metadata to drive the dashboard, timeline,
 * step detail pages, and AI context windows. Free tier = steps 1-6
 * (all of Phase 1). Steps 7+ are paywalled.
 *
 * Mirrors / replaces /lib/constants.ts's phase shape with a flat list.
 * Phase grouping lives in PHASE_META below.
 */

export type Step = {
  number: number; // 1..47
  phase: number; // 1..5
  phaseName: string;
  title: string;
  shortDescription: string;
  estimatedMinutes: number;
  documentsNeeded: number;
  tips: string[];
  commonMistakes: string[];
  instructions: string;
  isFree: boolean;
};

export const PHASE_META = [
  { number: 1, name: "Before your I-20", id: "before-i20" },
  { number: 2, name: "After I-20 arrival", id: "after-i20" },
  { number: 3, name: "DS-160 and fees", id: "ds160" },
  { number: 4, name: "Interview preparation", id: "interview-prep" },
  { number: 5, name: "Post-approval", id: "post-approval" },
] as const;

// Placeholder generator — keeps each step record honest without
// pretending the deep copy is finished. Real instructions arrive later.
const tip = (s: string) => [`Most students miss this: ${s}`];
const mistake = (s: string) => [s];
const instructions = (s: string) =>
  `${s} Full step-by-step walkthrough lives in the step detail page once you open it.`;

export const STEPS: Step[] = [
  // -------------------- Phase 1: Before your I-20 (6) --------------------
  {
    number: 1, phase: 1, phaseName: "Before your I-20",
    title: "Choose universities matching your profile",
    shortDescription:
      "Research and shortlist 8–12 US universities across reach, target, and safety tiers.",
    estimatedMinutes: 240, documentsNeeded: 0,
    tips: tip("Include 3–4 safety schools. Top-20-only lists are how applicants end up with no admits."),
    commonMistakes: mistake("Ranking-only filter ignores fit, funding, and OPT outcomes."),
    instructions: instructions("Build a balanced list based on your major, budget, and post-grad goals."),
    isFree: true,
  },
  {
    number: 2, phase: 1, phaseName: "Before your I-20",
    title: "Take required tests (TOEFL/IELTS, SAT/GRE/GMAT)",
    shortDescription:
      "Schedule and take English + standardized tests at least 4 months before your earliest deadline.",
    estimatedMinutes: 1200, documentsNeeded: 0,
    tips: tip("Book the retake slot before you take the first test. It removes the panic."),
    commonMistakes: mistake("Underestimating prep time and missing a deadline by one week."),
    instructions: instructions("Plan tests to leave a retake window before your earliest application deadline."),
    isFree: true,
  },
  {
    number: 3, phase: 1, phaseName: "Before your I-20",
    title: "Submit applications and receive admission",
    shortDescription:
      "Common App for undergrad, direct-to-school for grad. Decisions take 2 weeks to 4 months.",
    estimatedMinutes: 900, documentsNeeded: 5,
    tips: tip("Save every SOP draft — schools often ask for slight variants."),
    commonMistakes: mistake("One generic SOP across every school. Officers can tell."),
    instructions: instructions("Complete each application with school-specific essays + recommendations."),
    isFree: true,
  },
  {
    number: 4, phase: 1, phaseName: "Before your I-20",
    title: "Compare financial aid packages",
    shortDescription:
      "Look at net cost after scholarships, assistantships, and on-campus work — not sticker price.",
    estimatedMinutes: 120, documentsNeeded: 0,
    tips: tip("A school with strong assistantships can be cheaper than a 'cheaper' school without them."),
    commonMistakes: mistake("Comparing tuition alone and missing $20k+ in living and insurance costs."),
    instructions: instructions("Spreadsheet net cost for each admit including housing, insurance, and travel."),
    isFree: true,
  },
  {
    number: 5, phase: 1, phaseName: "Before your I-20",
    title: "Accept your offer and confirm enrollment",
    shortDescription:
      "Pay the enrollment deposit by the May 1 deadline. Notify schools you're declining.",
    estimatedMinutes: 60, documentsNeeded: 1,
    tips: tip("Email the schools you're declining — most send a short thank-you back and your DSO doesn't double-issue I-20s."),
    commonMistakes: mistake("Missing the May 1 deposit deadline and losing the seat."),
    instructions: instructions("Submit the enrollment deposit and any required pre-arrival financial docs."),
    isFree: true,
  },
  {
    number: 6, phase: 1, phaseName: "Before your I-20",
    title: "Receive your I-20 from your university",
    shortDescription:
      "Schools courier the I-20 within 2–4 weeks of enrollment confirmation. Track it carefully.",
    estimatedMinutes: 30, documentsNeeded: 1,
    tips: tip("Without an I-20 you cannot pay the SEVIS fee or schedule a visa interview. Pursue it relentlessly."),
    commonMistakes: mistake("Letting the I-20 sit unverified for days after it arrives."),
    instructions: instructions("Verify every field against your passport the moment the I-20 lands."),
    isFree: true,
  },

  // -------------------- Phase 2: After I-20 arrival (8) --------------------
  {
    number: 7, phase: 2, phaseName: "After I-20 arrival",
    title: "Verify all I-20 details for accuracy",
    shortDescription:
      "Check name, DOB, program, dates, SEVIS ID against your passport. A typo voids the document.",
    estimatedMinutes: 30, documentsNeeded: 2,
    tips: tip("Even a missing middle initial can trigger a reissue. Compare character by character."),
    commonMistakes: mistake("Assuming the university got it right and only checking the top half."),
    instructions: instructions("Cross-check every field. Email your DSO same-day if anything is off."),
    isFree: false,
  },
  {
    number: 8, phase: 2, phaseName: "After I-20 arrival",
    title: "Pay the SEVIS I-901 fee",
    shortDescription: "$350 online at FMJfee.com using your SEVIS ID. Non-refundable.",
    estimatedMinutes: 30, documentsNeeded: 1,
    tips: tip("Pay from a stable internet connection — receipt download fails on flaky connections."),
    commonMistakes: mistake("Typing SEVIS ID wrong by one digit, paying for a stranger."),
    instructions: instructions("Pay via credit card. Save and print the receipt twice."),
    isFree: false,
  },
  {
    number: 9, phase: 2, phaseName: "After I-20 arrival",
    title: "Print SEVIS payment receipt",
    shortDescription: "Print at least two copies. The officer keeps one, you carry one.",
    estimatedMinutes: 15, documentsNeeded: 0,
    tips: tip("Save the PDF in three places (email, cloud, local) before printing."),
    commonMistakes: mistake("Showing up with the receipt only on phone — many consulates require paper."),
    instructions: instructions("Two printed copies plus a digital backup."),
    isFree: false,
  },
  {
    number: 10, phase: 2, phaseName: "After I-20 arrival",
    title: "Gather passport and identity documents",
    shortDescription:
      "Passport (6+ months validity), birth certificate, national ID, prior passports.",
    estimatedMinutes: 60, documentsNeeded: 4,
    tips: tip("Three photocopy sets is the conservative standard — never assume one is enough."),
    commonMistakes: mistake("Passport expiring within 6 months of intended US stay — auto-rejection."),
    instructions: instructions("Originals + 3 photocopy sets in a labeled folder."),
    isFree: false,
  },
  {
    number: 11, phase: 2, phaseName: "After I-20 arrival",
    title: "Compile financial proof documents",
    shortDescription:
      "Show you can fund year 1: bank statements, sponsor affidavit, loan sanction letter.",
    estimatedMinutes: 180, documentsNeeded: 6,
    tips: tip("Six months of consistent balances beats one big recent deposit. Officers look for stability."),
    commonMistakes: mistake("A single large recent deposit raises red flags about source of funds."),
    instructions: instructions("Last 6 months bank statements, FDs, sponsor affidavit, loan sanction letter."),
    isFree: false,
  },
  {
    number: 12, phase: 2, phaseName: "After I-20 arrival",
    title: "Organize academic transcripts and certificates",
    shortDescription:
      "Originals from every institution since secondary school plus test scorecards.",
    estimatedMinutes: 120, documentsNeeded: 5,
    tips: tip("Keep digital backups on a USB drive in case the originals get held up at a checkpoint."),
    commonMistakes: mistake("Missing one institution from the chronology — explained in interview as a 'gap'."),
    instructions: instructions("Reverse-chronological transcripts + scorecards, originals + copies."),
    isFree: false,
  },
  {
    number: 13, phase: 2, phaseName: "After I-20 arrival",
    title: "Prepare ties-to-home-country evidence",
    shortDescription:
      "Family property, conditional job offers, business succession plans — anything that says 'I'll return.'",
    estimatedMinutes: 120, documentsNeeded: 4,
    tips: tip("Specific > sentimental. 'I love my country' is not an answer."),
    commonMistakes: mistake("Bringing vague emotional appeals instead of concrete documents."),
    instructions: instructions("Property docs, conditional job offers, family business plans."),
    isFree: false,
  },
  {
    number: 14, phase: 2, phaseName: "After I-20 arrival",
    title: "Get passport-sized photos meeting US specs",
    shortDescription: "2×2 inches, white bg, last 6 months, no glasses, neutral expression.",
    estimatedMinutes: 30, documentsNeeded: 0,
    tips: tip("The photo must be taken within the last 6 months. Old photos are the #1 cause of DS-160 rejection."),
    commonMistakes: mistake("Using a 2-year-old photo because 'I haven't changed' — DS-160 rejects them."),
    instructions: instructions("Studio near the consulate — they know the exact spec."),
    isFree: false,
  },

  // -------------------- Phase 3: DS-160 and fees (12) --------------------
  {
    number: 15, phase: 3, phaseName: "DS-160 and fees",
    title: "Create CEAC account on US State Department site",
    shortDescription:
      "ceac.state.gov/genniv — pick the right consulate. This is locked once you start.",
    estimatedMinutes: 20, documentsNeeded: 0,
    tips: tip("Note your application ID immediately — you'll need it to save and resume."),
    commonMistakes: mistake("Picking the wrong consulate and being unable to change it later."),
    instructions: instructions("Create account, pick consulate carefully, save the application ID."),
    isFree: false,
  },
  {
    number: 16, phase: 3, phaseName: "DS-160 and fees",
    title: "Begin DS-160 form with personal information",
    shortDescription: "Personal info exactly as on passport. Save every page; 20-min timeout.",
    estimatedMinutes: 45, documentsNeeded: 1,
    tips: tip("Save every page — the form times out after 20 minutes and your work is gone."),
    commonMistakes: mistake("Using a nickname instead of the legal name from the passport."),
    instructions: instructions("Name, DOB, nationality, contact info — match passport exactly."),
    isFree: false,
  },
  {
    number: 17, phase: 3, phaseName: "DS-160 and fees",
    title: "Complete travel and US contact sections",
    shortDescription:
      "Intended arrival date, US address (school is fine), trip arranger.",
    estimatedMinutes: 30, documentsNeeded: 1,
    tips: tip("If you don't have housing yet, your university's address is a valid US contact."),
    commonMistakes: mistake("Guessing an arrival date wildly off from your program start."),
    instructions: instructions("Arrival within 30 days of program start, school address as US contact."),
    isFree: false,
  },
  {
    number: 18, phase: 3, phaseName: "DS-160 and fees",
    title: "Fill family and education sections",
    shortDescription:
      "Parent details + reverse-chronological education since secondary school.",
    estimatedMinutes: 45, documentsNeeded: 0,
    tips: tip("List every institution including the months attended — gaps will be asked about."),
    commonMistakes: mistake("Omitting a brief institution stint — looks like concealment if surfaced."),
    instructions: instructions("Complete family + education sections with no gaps."),
    isFree: false,
  },
  {
    number: 19, phase: 3, phaseName: "DS-160 and fees",
    title: "Complete work, training, and security sections",
    shortDescription:
      "Last 5 years of employers, prior visas, security questions. Answer truthfully.",
    estimatedMinutes: 60, documentsNeeded: 1,
    tips: tip("Deception on security questions is grounds for permanent inadmissibility. Be honest, always."),
    commonMistakes: mistake("Forgetting a brief internship — it surfaces in background check."),
    instructions: instructions("Be exhaustive and honest. Security questions are not where to be clever."),
    isFree: false,
  },
  {
    number: 20, phase: 3, phaseName: "DS-160 and fees",
    title: "Upload photo to DS-160",
    shortDescription: "600×600 to 1200×1200 JPEG, under 240KB, white bg, no glasses.",
    estimatedMinutes: 15, documentsNeeded: 1,
    tips: tip("If the upload keeps failing, you can present the physical photo at the interview as a fallback."),
    commonMistakes: mistake("Glasses, shadows, off-center — instant upload rejection."),
    instructions: instructions("Upload the digital version of the studio photo."),
    isFree: false,
  },
  {
    number: 21, phase: 3, phaseName: "DS-160 and fees",
    title: "Review and submit DS-160",
    shortDescription:
      "Re-read every page. After submission, corrections require a brand-new application.",
    estimatedMinutes: 45, documentsNeeded: 0,
    tips: tip("Have someone else read it too — fresh eyes catch what you've stopped seeing."),
    commonMistakes: mistake("Submitting with a typo on SEVIS ID — restart from scratch."),
    instructions: instructions("Read every page slowly. Then submit."),
    isFree: false,
  },
  {
    number: 22, phase: 3, phaseName: "DS-160 and fees",
    title: "Print DS-160 confirmation page with barcode",
    shortDescription: "Two printed copies, plain white paper. Officer scans the barcode.",
    estimatedMinutes: 15, documentsNeeded: 0,
    tips: tip("Only the confirmation page is needed at the interview — not the full PDF."),
    commonMistakes: mistake("Bringing the full DS-160 PDF instead of just the confirmation page."),
    instructions: instructions("Print the confirmation page (with barcode) twice."),
    isFree: false,
  },
  {
    number: 23, phase: 3, phaseName: "DS-160 and fees",
    title: "Create profile on US visa service site for your country",
    shortDescription:
      "Separate site (USTravelDocs/AIS). Same name/DOB as passport + DS-160.",
    estimatedMinutes: 20, documentsNeeded: 0,
    tips: tip("Use the same email everywhere — DS-160, CEAC, USTravelDocs. Mismatches cause delays."),
    commonMistakes: mistake("Inconsistent name spelling across the visa service site and DS-160."),
    instructions: instructions("Profile creation, link DS-160 confirmation."),
    isFree: false,
  },
  {
    number: 24, phase: 3, phaseName: "DS-160 and fees",
    title: "Pay the MRV visa application fee",
    shortDescription: "$185 for F-1. Payment unlocks appointment booking (1–2 day clear time).",
    estimatedMinutes: 20, documentsNeeded: 1,
    tips: tip("Pay 2-3 days before you want to book — the clearance delay is real."),
    commonMistakes: mistake("Trying to book the appointment immediately and finding payment hasn't cleared."),
    instructions: instructions("Pay MRV via the country-specific method; save the receipt."),
    isFree: false,
  },
  {
    number: 25, phase: 3, phaseName: "DS-160 and fees",
    title: "Schedule biometrics appointment (if required)",
    shortDescription:
      "Some consulates require fingerprints + photo at a Visa Application Center.",
    estimatedMinutes: 20, documentsNeeded: 2,
    tips: tip("Book biometrics 2-3 days before the interview so data is on file when you arrive."),
    commonMistakes: mistake("Booking biometrics for the same day as the interview — data may not be ready."),
    instructions: instructions("Book biometrics window that precedes the interview by at least 2 days."),
    isFree: false,
  },
  {
    number: 26, phase: 3, phaseName: "DS-160 and fees",
    title: "Schedule visa interview appointment",
    shortDescription:
      "Earliest available slot that still leaves prep time. Watch consulate wait times.",
    estimatedMinutes: 15, documentsNeeded: 0,
    tips: tip("Booking too close to your I-20 start date is risky if you face administrative processing."),
    commonMistakes: mistake("Booking the latest possible slot 'to prepare more' and missing program start."),
    instructions: instructions("Book the earliest workable slot."),
    isFree: false,
  },

  // -------------------- Phase 4: Interview preparation (14) --------------------
  {
    number: 27, phase: 4, phaseName: "Interview preparation",
    title: "Organize all required documents in folder order",
    shortDescription:
      "Clear plastic folder, ordered by what the officer asks for. No staples or binders.",
    estimatedMinutes: 60, documentsNeeded: 12,
    tips: tip("Officers want to flip quickly. Staples and binders slow them down — and annoy them."),
    commonMistakes: mistake("Bringing a binder and watching the officer's mood shift."),
    instructions: instructions("Single clear folder, ordered: passport, I-20, DS-160 conf, SEVIS, financials..."),
    isFree: false,
  },
  {
    number: 28, phase: 4, phaseName: "Interview preparation",
    title: "Prepare academic statement explaining your program",
    shortDescription:
      "Two-to-three-sentence answer covering what, why this program, and career outcome.",
    estimatedMinutes: 90, documentsNeeded: 0,
    tips: tip("Officers test whether you understand your own plan. Vague answers are red flags."),
    commonMistakes: mistake("Memorized speech that crumbles under one follow-up question."),
    instructions: instructions("Write, refine, rehearse the academic statement. Internalize, don't memorize."),
    isFree: false,
  },
  {
    number: 29, phase: 4, phaseName: "Interview preparation",
    title: "Document your university selection rationale",
    shortDescription:
      "Why this school over the others that admitted you? Specific reasons, not 'good school.'",
    estimatedMinutes: 60, documentsNeeded: 0,
    tips: tip("Name a professor, a course sequence, or an industry partnership — be specific."),
    commonMistakes: mistake("'It has a good ranking' — the single worst answer to this question."),
    instructions: instructions("Write 3 specific reasons tied to your career goal."),
    isFree: false,
  },
  {
    number: 30, phase: 4, phaseName: "Interview preparation",
    title: "Prepare financial sponsor documentation",
    shortDescription:
      "Tax returns, bank statements, employment letters, signed affidavit of support.",
    estimatedMinutes: 120, documentsNeeded: 6,
    tips: tip("Funding gaps are the #1 reason for refusals. Over-document, never under."),
    commonMistakes: mistake("Showing exactly the I-20 amount with zero buffer — looks tight."),
    instructions: instructions("Compile sponsor docs with 20%+ buffer over the I-20 cost."),
    isFree: false,
  },
  {
    number: 31, phase: 4, phaseName: "Interview preparation",
    title: "Document return-to-home-country ties",
    shortDescription:
      "Concrete evidence you'll return: property, business, conditional job offers.",
    estimatedMinutes: 90, documentsNeeded: 4,
    tips: tip("Specific commitments — a conditional job offer letter — outweigh emotional appeals."),
    commonMistakes: mistake("Listing 'my family is here' as the only tie."),
    instructions: instructions("Compile concrete tie documents with attached explanations."),
    isFree: false,
  },
  {
    number: 32, phase: 4, phaseName: "Interview preparation",
    title: "Practice answering common interview questions",
    shortDescription:
      "Why this university, who's funding you, post-grad plans, return intent.",
    estimatedMinutes: 240, documentsNeeded: 0,
    tips: tip("Two-sentence answers. Officers see 80 people a day; brevity is respect."),
    commonMistakes: mistake("Long, hedged answers that lose the officer's attention by sentence three."),
    instructions: instructions("Write answers, then rehearse them out loud until they're conversational."),
    isFree: false,
  },
  {
    number: 33, phase: 4, phaseName: "Interview preparation",
    title: "Complete first mock interview",
    shortDescription:
      "Formal setting, English, no script. Record yourself for review.",
    estimatedMinutes: 60, documentsNeeded: 0,
    tips: tip("Watch the recording. You'll catch filler words and evasions you didn't notice in the moment."),
    commonMistakes: mistake("Skipping the recording — losing 80% of the value."),
    instructions: instructions("One mock, fully simulated, recorded, reviewed."),
    isFree: false,
  },
  {
    number: 34, phase: 4, phaseName: "Interview preparation",
    title: "Review and refine answers based on feedback",
    shortDescription:
      "Identify your 3 weakest answers, rewrite them, internalize the new versions.",
    estimatedMinutes: 90, documentsNeeded: 0,
    tips: tip("Don't memorize the new version — internalize the structure so it sounds natural."),
    commonMistakes: mistake("Writing a new word-perfect script that comes out robotic."),
    instructions: instructions("Three answers, rewritten, practiced until conversational."),
    isFree: false,
  },
  {
    number: 35, phase: 4, phaseName: "Interview preparation",
    title: "Complete second mock interview",
    shortDescription:
      "Different person, fresh eyes. Aim for shorter, more confident answers.",
    estimatedMinutes: 60, documentsNeeded: 0,
    tips: tip("By round 2, your delivery should sound like a conversation — not a recital."),
    commonMistakes: mistake("Using the same mock partner — you both get used to the script."),
    instructions: instructions("Fresh partner, full simulation, recorded."),
    isFree: false,
  },
  {
    number: 36, phase: 4, phaseName: "Interview preparation",
    title: "Plan your interview day logistics",
    shortDescription:
      "Route, parking, arrival time (15 min early — no earlier), phone, food.",
    estimatedMinutes: 30, documentsNeeded: 0,
    tips: tip("Eat something — interviews can run hours past the scheduled time."),
    commonMistakes: mistake("Arriving 45 minutes early and being told to come back."),
    instructions: instructions("Plan route + arrival window + day-of logistics."),
    isFree: false,
  },
  {
    number: 37, phase: 4, phaseName: "Interview preparation",
    title: "Confirm consulate location and timing",
    shortDescription:
      "Consulate address on your appointment letter is the truth — Maps can be wrong.",
    estimatedMinutes: 20, documentsNeeded: 1,
    tips: tip("Drive past or walk past the consulate the day before if you can."),
    commonMistakes: mistake("Trusting Google Maps over the appointment letter address."),
    instructions: instructions("Verify address against appointment letter, scout if possible."),
    isFree: false,
  },
  {
    number: 38, phase: 4, phaseName: "Interview preparation",
    title: "Prepare interview-day outfit",
    shortDescription:
      "Business casual: collared shirt, slacks, closed shoes. No loud logos.",
    estimatedMinutes: 30, documentsNeeded: 0,
    tips: tip("The goal is to remove every distraction the officer might fixate on. Be invisible, in a good way."),
    commonMistakes: mistake("Bright logos or anything you'd be uncomfortable in for 3 hours."),
    instructions: instructions("Lay out the outfit the night before."),
    isFree: false,
  },
  {
    number: 39, phase: 4, phaseName: "Interview preparation",
    title: "Final document checklist verification",
    shortDescription:
      "Night-before checklist: passport, DS-160 conf, SEVIS, I-20 (signed), photo, fees.",
    estimatedMinutes: 30, documentsNeeded: 12,
    tips: tip("Cross-check against your consulate's specific list one more time — they vary."),
    commonMistakes: mistake("Missing an I-20 DSO signature — officer rejects on the spot."),
    instructions: instructions("Complete checklist verification the night before."),
    isFree: false,
  },
  {
    number: 40, phase: 4, phaseName: "Interview preparation",
    title: "Attend biometrics appointment (if applicable)",
    shortDescription:
      "Fingerprints + photo at Visa Application Center. <10 minutes if you booked right.",
    estimatedMinutes: 60, documentsNeeded: 2,
    tips: tip("Bring the passport and appointment letter only — phones often not allowed inside."),
    commonMistakes: mistake("Showing up without the appointment letter and being turned away."),
    instructions: instructions("Biometrics appointment, passport + letter in hand."),
    isFree: false,
  },

  // -------------------- Phase 5: Post-approval (7) --------------------
  {
    number: 41, phase: 5, phaseName: "Post-approval",
    title: "Attend visa interview",
    shortDescription:
      "Be polite, direct, confident. Short answers. Eye contact. Decision usually on the spot.",
    estimatedMinutes: 15, documentsNeeded: 12,
    tips: tip("The interview itself is typically under 5 minutes. Don't over-explain."),
    commonMistakes: mistake("Over-explaining a simple answer until you contradict yourself."),
    instructions: instructions("Polite + concise. Trust your prep."),
    isFree: false,
  },
  {
    number: 42, phase: 5, phaseName: "Post-approval",
    title: "Track passport status after approval",
    shortDescription:
      "5–10 business days to pickup or courier. Watch for 221(g) administrative processing.",
    estimatedMinutes: 20, documentsNeeded: 0,
    tips: tip("221(g) notices add weeks but rarely mean refusal. Respond to any document request fast."),
    commonMistakes: mistake("Panicking on 221(g) and not responding promptly to document requests."),
    instructions: instructions("Track passport status on the visa service site daily."),
    isFree: false,
  },
  {
    number: 43, phase: 5, phaseName: "Post-approval",
    title: "Receive passport with stamped visa",
    shortDescription:
      "Verify the visa is in your passport and the I-20 wasn't retained by the consulate.",
    estimatedMinutes: 20, documentsNeeded: 0,
    tips: tip("Check the visa expiration — F-1 visas vary from 5 days to 5 years by country."),
    commonMistakes: mistake("Not checking until the day of travel — and finding an error."),
    instructions: instructions("Verify visa on receipt; contact consulate same-day for errors."),
    isFree: false,
  },
  {
    number: 44, phase: 5, phaseName: "Post-approval",
    title: "Verify visa details for accuracy",
    shortDescription:
      "Name, DOB, photo, class (F1), entries, expiration. The I-20 governs your length of stay.",
    estimatedMinutes: 20, documentsNeeded: 0,
    tips: tip("The visa lets you enter the US. The I-20 governs how long you can stay."),
    commonMistakes: mistake("Confusing visa expiration with I-20 program end date."),
    instructions: instructions("Cross-check every visa field. Request correction immediately if wrong."),
    isFree: false,
  },
  {
    number: 45, phase: 5, phaseName: "Post-approval",
    title: "Complete pre-departure preparations",
    shortDescription:
      "Book travel within 30 days of program start. Carry academic docs in your carry-on.",
    estimatedMinutes: 240, documentsNeeded: 6,
    tips: tip("CBP only admits F-1 students up to 30 days before program start. Don't book earlier."),
    commonMistakes: mistake("Booking flights 60 days early and being denied entry at the airport."),
    instructions: instructions("Travel within the 30-day window; carry-on holds all docs."),
    isFree: false,
  },
  {
    number: 46, phase: 5, phaseName: "Post-approval",
    title: "Validate SEVIS upon US arrival",
    shortDescription:
      "Present I-20 + passport together at CBP. They scan the I-20 to activate your record.",
    estimatedMinutes: 60, documentsNeeded: 2,
    tips: tip("Never present passport separately from I-20 — that's how SEVIS validation gets missed."),
    commonMistakes: mistake("Handing the officer only the passport and forgetting the I-20."),
    instructions: instructions("Passport + I-20 together at CBP. Save the I-94 record screenshot."),
    isFree: false,
  },
  {
    number: 47, phase: 5, phaseName: "Post-approval",
    title: "Complete first-week-in-US essentials",
    shortDescription:
      "Check in with international office, attend orientation, US phone, bank, SSN appointment.",
    estimatedMinutes: 1200, documentsNeeded: 6,
    tips: tip("Within 30 days you must check in with your university's international office. Don't drift."),
    commonMistakes: mistake("Skipping the check-in window and triggering a SEVIS termination."),
    instructions: instructions("Run the first-week checklist within day 1-30 of arrival."),
    isFree: false,
  },
];

export const TOTAL_STEPS = STEPS.length;

export function stepByNumber(n: number): Step | undefined {
  return STEPS.find((s) => s.number === n);
}
