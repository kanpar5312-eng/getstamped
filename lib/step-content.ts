/**
 * Rich step content — sub-steps, document checklists, common mistakes
 * with body copy, "why this matters" prose, related steps.
 *
 * Steps 1–7 are defined inline below. Steps 8–47 live in
 * step-content-extended.ts and are merged at lookup time.
 */

import { STEPS, stepByNumber, type Step } from "@/lib/steps";
import { EXTENDED_RICH } from "@/lib/step-content-extended";

export type SubStep = {
  title: string;
  body: string;
  link?: { label: string; href: string };
};

export type DocItem = {
  name: string;
  description: string;
  required: boolean;
};

export type MistakeCard = {
  title: string;
  body: string;
};

export type StepRichContent = {
  intro: string;
  subSteps: SubStep[];
  outro?: string;
  documents: DocItem[];
  mistakes: MistakeCard[];
  whyItMatters: string;
  relatedSteps: number[];
};

const RICH: Record<number, StepRichContent> = {
  1: {
    intro:
      "Your university list is the foundation of every step that follows. Build it intentionally now or scramble later.",
    subSteps: [
      {
        title: "Map your reach, target, safety tiers",
        body: "Aim for 3–4 schools in each tier. Reach = scores below the school's median. Target = scores at the median. Safety = scores above the median plus a backup plan if the rest don't admit you.",
      },
      {
        title: "Filter by program, not by ranking",
        body: "A #50 school with a strong program in your major beats a #15 school where you'd be a poor fit. Look at faculty research pages, recent placement data, and capstone or thesis structures.",
      },
      {
        title: "Cross-check funding patterns",
        body: "For grad programs, check if assistantships are funded for international students. For undergrad, check need-blind status and merit-aid history at your scoring band.",
      },
      {
        title: "Save admissions data per school",
        body: "Build a single spreadsheet now: deadline, fees, required tests, document list, contact email. You will reference it weekly.",
        link: {
          label: "Common Data Sets (search any school)",
          href: "https://www.google.com/search?q=common+data+set",
        },
      },
    ],
    outro:
      "Once your list is locked, the next 5 phases become a matter of execution. Wishful lists turn into rejected applications.",
    documents: [
      { name: "School shortlist spreadsheet", description: "Your master list — every school with deadline, fees, requirements.", required: false },
    ],
    mistakes: [
      {
        title: "Ranking-only filtering",
        body: "US News ranks the school, not the program. CS at one school can be elite while the same school's English department is unremarkable.",
      },
      {
        title: "No safeties",
        body: "International applicants face the same admit rates as domestic — sometimes worse. A list with no safety can leave you with zero admits.",
      },
      {
        title: "Ignoring funding",
        body: "An expensive school with a $30k/year assistantship is cheaper than a 'cheap' school with no funding.",
      },
    ],
    whyItMatters:
      "Every later step is shaped by where you apply. Funding requirements, test scores, even DS-160 fields depend on the schools on this list. Build it carefully now and you skip three weeks of replan work in Phase 2.",
    relatedSteps: [2, 3, 4],
  },

  2: {
    intro:
      "Your test scores aren't just admissions — they're documentation the consulate may verify. Plan tests so you have a retake window before applications.",
    subSteps: [
      {
        title: "Pick the right English test",
        body: "TOEFL iBT is accepted everywhere. IELTS Academic is accepted at most US schools. Duolingo English Test is accepted at some but inconsistently. When in doubt, take TOEFL.",
      },
      {
        title: "Choose your standardized test",
        body: "Undergrad: SAT (or test-optional at many schools). Grad: GRE (general for most, subject for specific PhDs). Business: GMAT.",
      },
      {
        title: "Book test + retake slots together",
        body: "Book the retake before you take the first test. This removes the temptation to skip the retake — and removes the 6-week scramble if you need it.",
      },
      {
        title: "Send scores to schools directly",
        body: "Use the official score-send process from the test provider. Self-reported scores don't count for visa documentation later.",
      },
    ],
    outro:
      "Tests are 4-month projects, not 4-week ones. Start now and you have options if the first attempt underperforms.",
    documents: [
      { name: "Official TOEFL / IELTS scorecard", description: "Sent directly from ETS or British Council to your schools.", required: true },
      { name: "Official SAT / GRE / GMAT scorecard", description: "Test-specific report sent through the official portal.", required: false },
    ],
    mistakes: [
      {
        title: "Self-reporting scores",
        body: "Most schools require official score reports, not just numbers on your application. Self-reports may withdraw your admission if discovered.",
      },
      {
        title: "Booking too late",
        body: "Test centers fill up — especially in the September/October window. Book 3 months ahead at minimum.",
      },
    ],
    whyItMatters:
      "Scores are the first thing admissions officers see and the first thing visa officers verify. Underprepared scores cost you both the seat and the visa interview confidence later.",
    relatedSteps: [3, 4],
  },

  3: {
    intro:
      "Applications are 80% craft and 20% form. Treat each school's essays as the difference between an admit and a rejection.",
    subSteps: [
      {
        title: "Common App for undergrad",
        body: "One form, multiple schools. Each school adds its own supplemental essay set. Plan 2-4 weeks per supplement.",
      },
      {
        title: "Direct portal for grad",
        body: "Each grad program has its own portal. Use a master spreadsheet to track deadlines, login info, and essay drafts.",
      },
      {
        title: "Tailor every Statement of Purpose",
        body: "Same structure, different specifics per school: which faculty, which courses, which industry pipeline. Generic SOPs are obvious and rejected.",
      },
      {
        title: "Request rec letters early",
        body: "Give recommenders 4–6 weeks. Provide them with your SOP draft and 2-3 specific projects to reference.",
      },
    ],
    outro:
      "Admit results arrive over a 4-month window. Don't make plans until you have an offer in writing.",
    documents: [
      { name: "Statement of Purpose (per school)", description: "Tailored essay covering motivation, fit, and post-grad plan.", required: true },
      { name: "Recommendation letters", description: "Typically 2-3 academic, sent directly by the recommender.", required: true },
      { name: "Application transcripts", description: "Official transcripts sent from your institution to each school.", required: true },
      { name: "Resume / CV", description: "1-2 pages for undergrad, 2-3 for grad.", required: true },
      { name: "Standardized test scores", description: "Official reports sent from the test provider.", required: false },
    ],
    mistakes: [
      {
        title: "One generic SOP",
        body: "Admissions officers read hundreds. A school-agnostic SOP gets rejected on principle.",
      },
      {
        title: "Last-minute recommenders",
        body: "Asking for letters with 2 weeks notice produces weak letters — or no letters at all.",
      },
    ],
    whyItMatters:
      "The admit packet is the foundation of your I-20, which is the foundation of your visa. Better admits mean stronger funding, which means stronger visa interview material.",
    relatedSteps: [4, 5],
  },

  4: {
    intro:
      "Compare net cost — not sticker price. The school with the highest tuition can be the cheapest after funding.",
    subSteps: [
      {
        title: "Build a net-cost spreadsheet",
        body: "Per school: tuition + fees + housing + insurance + travel + visa costs. Subtract: scholarships + assistantships + on-campus work allowance.",
      },
      {
        title: "Verify funding terms in writing",
        body: "Assistantships and scholarships should be in the admit letter. Verbal promises don't count for I-20 documentation.",
      },
      {
        title: "Factor in F-1 work limits",
        body: "F-1 limits you to on-campus work (20 hrs/week during term). Off-campus work requires OPT or CPT later. Don't assume you can supplement income.",
      },
      {
        title: "Compare 4-year totals, not year-1",
        body: "Some schools front-load aid in year 1 and pull it in year 2-3. Get year-by-year breakdowns.",
      },
    ],
    outro:
      "Pick the school you can fund without hardship. Visa officers ask about funding sustainability — your answer needs to be confident.",
    documents: [
      { name: "Admit letters with funding details", description: "From each school you're comparing.", required: true },
      { name: "Net-cost comparison spreadsheet", description: "Your own analysis covering all 4 years.", required: false },
    ],
    mistakes: [
      {
        title: "Comparing sticker price",
        body: "A $70k school with $40k in aid is cheaper than a $50k school with $5k in aid.",
      },
      {
        title: "Ignoring health insurance",
        body: "US student health insurance runs $2k–$5k per year and is usually mandatory. Include it.",
      },
    ],
    whyItMatters:
      "Your financial documentation in Phase 2 directly mirrors the choice you make here. Underestimating cost means underestimating financial proof — and visa officers notice.",
    relatedSteps: [5, 11],
  },

  5: {
    intro:
      "Once you accept, you commit. Pay the deposit, decline the others, and the I-20 process begins.",
    subSteps: [
      {
        title: "Pay the enrollment deposit",
        body: "Usually $300–$1,000. Due by May 1 for most US undergrad programs; varies for grad. Holds your seat.",
      },
      {
        title: "Decline other admits",
        body: "Email the schools you're declining same day. They reassign seats to waitlisted students — and your DSO won't double-issue an I-20 if you've withdrawn formally.",
      },
      {
        title: "Submit pre-arrival financial documents",
        body: "Your accepted school will ask for a Financial Resources Statement plus bank statements proving year-1 funding. Submit these to trigger I-20 issuance.",
      },
    ],
    outro:
      "From this point your visa timeline is on the school's clock. Stay responsive to international office emails.",
    documents: [
      { name: "Enrollment deposit receipt", description: "Email confirmation from the school.", required: true },
      { name: "Financial Resources Statement", description: "Standard form most schools require for I-20 issuance.", required: true },
      { name: "Bank statements (6 months)", description: "Demonstrating year-1 funding ability.", required: true },
      { name: "Affidavit of support (if sponsored)", description: "Required if parents or sponsors are funding you.", required: false },
    ],
    mistakes: [
      {
        title: "Missing the deposit deadline",
        body: "Most schools won't extend — they reassign the seat to a waitlisted student.",
      },
      {
        title: "Forgetting to decline",
        body: "Schools you don't decline may issue an I-20 anyway, creating SEVIS confusion.",
      },
    ],
    whyItMatters:
      "Without enrollment confirmation + financial proof, your I-20 doesn't get issued. Without an I-20, the visa process can't start.",
    relatedSteps: [6, 11],
  },

  6: {
    intro:
      "The I-20 is your golden ticket. Verify it the moment it arrives — typos void the document.",
    subSteps: [
      {
        title: "Track the courier",
        body: "Most schools use FedEx or DHL international courier. The school's international office sends you the tracking number; check daily.",
      },
      {
        title: "Verify every field same-day",
        body: "Name (must match passport exactly), DOB, program name + level, start + end dates, SEVIS ID number, total cost listed.",
      },
      {
        title: "Sign the bottom of page 1",
        body: "You must physically sign in the student signature box. Officers will reject an unsigned I-20 at the interview window.",
      },
      {
        title: "Save 3 copies + scan",
        body: "Original, two photocopies, plus a high-resolution scan saved in two cloud locations and one local drive.",
      },
    ],
    outro:
      "Your SEVIS ID from this I-20 is what unlocks everything from here — fee payment, DS-160, appointment booking.",
    documents: [
      { name: "Original signed I-20", description: "The school-issued document with your SEVIS ID.", required: true },
      { name: "I-20 photocopies (3 sets)", description: "Physical backups for the consulate and your travel folder.", required: true },
      { name: "I-20 scan (PDF)", description: "Digital backup in cloud + local storage.", required: false },
    ],
    mistakes: [
      {
        title: "Not verifying the name match",
        body: "Even a missing middle initial can void the document. The name on the I-20 must match your passport exactly.",
      },
      {
        title: "Letting it sit unsigned",
        body: "Officers reject unsigned I-20s on the spot. Sign within 24 hours of receiving it.",
      },
      {
        title: "Losing the original",
        body: "Schools charge reissue fees ($50–$200) and delay it 2-3 weeks.",
      },
    ],
    whyItMatters:
      "The I-20 is the single document the consulate officer holds for the entire interview. A wrong field or wrong signature can result in a 221(g) — even if everything else is perfect.",
    relatedSteps: [7, 8],
  },

  7: {
    intro:
      "Verification is one hour of work that prevents three weeks of delay. Do it carefully.",
    subSteps: [
      {
        title: "Cross-check name and DOB",
        body: "Open your passport. Compare letter-by-letter to the I-20 name field. Same for DOB — even the date format should match (Day-Month-Year vs Month-Day-Year confusion is real).",
      },
      {
        title: "Verify program details",
        body: "Major matches your admit letter exactly. Degree level matches (Bachelor's/Master's/PhD). Start date is within your travel plan window.",
      },
      {
        title: "Check the funding section",
        body: "I-20 lists your funding source (personal, scholarship, assistantship). It should match what you submitted. Discrepancies create awkward visa interview questions.",
      },
      {
        title: "Email DSO immediately if anything is off",
        body: "Designated School Officials reissue corrected I-20s within 1-2 weeks if you flag errors promptly. The longer you wait, the more it cascades into later steps.",
      },
    ],
    outro:
      "An accurate I-20 is a precondition for everything in Phase 2 onward.",
    documents: [
      { name: "Verified I-20", description: "Checked field-by-field against passport and admit letter.", required: true },
    ],
    mistakes: [
      {
        title: "Skimming the I-20",
        body: "Officers find typos students missed. Spend 30 minutes here to save 3 weeks later.",
      },
      {
        title: "Delaying error reports",
        body: "DSOs prioritize reissues by request date. Same-day report = 1 week reissue. Two-week-late report = 3-week reissue.",
      },
    ],
    whyItMatters:
      "Every consulate flags I-20 mismatches. Catching errors here keeps your interview clean. Missing them means a 221(g) administrative processing notice — average 6 weeks of waiting.",
    relatedSteps: [6, 8],
  },
};

export function getStepContent(stepNumber: number): {
  step: Step;
  content: StepRichContent;
} | null {
  const step = stepByNumber(stepNumber);
  if (!step) return null;

  const raw = RICH[stepNumber] ?? EXTENDED_RICH[stepNumber] ?? buildPlaceholder(step);
  // Extended entries may omit `documents` when the step needs none — normalize.
  const content: StepRichContent = { ...raw, documents: raw.documents ?? [] };
  return { step, content };
}

function buildPlaceholder(step: Step): StepRichContent {
  // Every step now has rich content directly on the Step object —
  // just adapt the shape to StepRichContent.
  return {
    intro: step.instructions.intro,
    subSteps: step.instructions.steps.map((s) => ({
      title: s.title,
      body: s.body,
    })),
    outro: step.instructions.outro,
    documents: step.documents.map((d) => ({
      name: d.name,
      description: d.description,
      required: true,
    })),
    mistakes: step.commonMistakes.map((m) => ({
      title: m.title,
      body: m.body,
    })),
    whyItMatters: step.whyItMatters,
    relatedSteps:
      step.relatedSteps ??
      [step.number - 1, step.number + 1].filter(
        (n) => n >= 1 && n <= STEPS.length,
      ),
  };
}
