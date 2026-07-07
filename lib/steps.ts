/**
 * /lib/steps.ts — canonical source of truth for the 47-step F-1 process.
 *
 * Every step is fully populated. This file drives:
 *   - the dashboard timeline
 *   - the per-step detail page
 *   - the document vault required-items list
 *   - the Ask AI context window for step-scoped questions
 *
 * Free tier = Phase 1 (steps 1-6). Steps 7+ require a paid plan.
 */

import type { HomeCountryCode } from "@/lib/home-countries";
import { resolveStepContent } from "@/lib/resolveStepContent";

export type Step = {
  number: number; // 1..47
  phase: number; // 1..5
  phaseName: string;
  phaseDescription: string;
  title: string;
  shortDescription: string;
  estimatedMinutes: number;
  documentsNeeded: number;
  isFree: boolean;
  hasCriticalTip: boolean;
  instructions: {
    intro: string;
    steps: {
      title: string;
      body: string;
      link?: { label: string; url: string };
    }[];
    outro?: string;
  };
  documents: {
    key: string;
    name: string;
    description: string;
    expiryRelevant?: boolean;
  }[];
  commonMistakes: {
    title: string;
    body: string;
  }[];
  whyItMatters: string;
  relatedSteps?: number[];
  officialSources: { label: string; url: string }[];
};

export const PHASE_META = [
  { number: 1, name: "Before your I-20", id: "before-i20" },
  { number: 2, name: "After I-20 arrival", id: "after-i20" },
  { number: 3, name: "DS-160 and fees", id: "ds160" },
  { number: 4, name: "Interview preparation", id: "interview-prep" },
  { number: 5, name: "Post-approval", id: "post-approval" },
] as const;

const PHASE_DESC: Record<number, string> = {
  1: "Pick the right schools, take the right tests, and get admitted. The I-20 you'll receive is the proof you've been accepted into a SEVP-certified program — without it, no F-1 visa is possible.",
  2: "I-20 in hand. Now you pay the SEVIS fee, gather identity + financial + academic documents, and build the evidence stack that proves you'll come home after the degree.",
  3: "Fill out the 91-field DS-160, pay the MRV fee, and book your visa interview. This is the longest paperwork stretch — and the part the officer reads before you sit down.",
  4: "The visa interview is 3-7 minutes. These steps are the rehearsal that makes the real one feel like you've already had it.",
  5: "Visa stamped. Now you travel, validate SEVIS at CBP, and complete the first-week-in-US essentials that keep your status clean.",
};

export const STEPS: Step[] = [
  // ============================================================
  // PHASE 1 — Before your I-20 (steps 1-6, free)
  // ============================================================
  {
    number: 1,
    phase: 1,
    phaseName: "Before your I-20",
    phaseDescription: PHASE_DESC[1],
    title: "Choose universities matching your profile",
    shortDescription:
      "Build a 10-school shortlist split across reach, target, and safety — every school SEVP-certified.",
    estimatedMinutes: 480,
    documentsNeeded: 0,
    isFree: true,
    hasCriticalTip: true,
    instructions: {
      intro:
        "University choice is the first compounding decision in your F-1 journey. Get this wrong and you spend months applying to schools that can't issue you an I-20 — or end up with admits to schools that don't serve your career. Treat this like the most important week of your prep.",
      steps: [
        {
          title: "Verify SEVP certification for every school",
          body:
            "Search each school on the official SEVP school finder before you spend any money on application fees. If a school isn't SEVP-certified, it cannot issue an I-20, period. Many community colleges and almost all fully-online programs aren't certified — don't assume.",
          link: {
            label: "SEVP school finder",
            url: "https://studyinthestates.dhs.gov/school-search",
          },
        },
        {
          title: "Build a 3-tier list (2 reach / 3 target / 5 safety)",
          body:
            "Aim for 10 schools split across reach, target, and safety. Reach = your dream schools where your stats are below the median. Target = realistic matches where your scores are at or above the median. Safety = strong-fit schools where you're in the top quartile of admits. A top-20-only list is how applicants end up with zero offers.",
        },
        {
          title: "Check STEM OPT eligibility per program",
          body:
            "STEM-designated programs (CIP codes on the DHS list) get a 24-month OPT extension after the standard 12-month OPT — total 36 months of US work authorization after graduation. Check this PER PROGRAM, not per school. A CS master's at the same university can be STEM while an MBA isn't.",
          link: {
            label: "DHS STEM-designated programs list",
            url: "https://www.ice.gov/sevis/stem",
          },
        },
        {
          title: "Look up I-20 processing time at each school",
          body:
            "Some schools issue I-20s within a week of enrollment confirmation. Others take 4-6 weeks. This matters because your visa interview cannot be booked without the I-20. Check the international student office page or email the DSO directly.",
        },
        {
          title: "Map every school to the consulate you'd interview at",
          body:
            "Where you interview depends on your home country, not the school — but knowing your consulate's interview patterns helps you prep. Approval patterns for STEM applicants can vary between consulates in the same country. Use that data when comparing fit.",
        },
        {
          title: "Score each shortlisted program on 4 factors — not just school ranking",
          body:
            "For every school on your list, fill in these 4 for the SPECIFIC PROGRAM (not just the university): (1) Total cost including living expenses for the full program length. (2) STEM OPT status — 12 vs. 36 months of post-grad US work authorization. (3) Curriculum fit — does the required coursework actually match the career you want, or just the department name? Read the actual course list, not just the program title. (4) I-20 timeline and consulate wait time for your specific interview location. A lower-ranked school that's STEM-designated with a program that matches your career goals often beats a 'better' school with a non-STEM program you're lukewarm on. Build this as a simple table — one row per school, one column per factor — before you commit to any application fees.",
        },
      ],
      outro:
        "Spend a full work-week on this list. The cost of a bad shortlist is months of your life and a meaningful amount of money in application + test fees.",
    },
    documents: [],
    commonMistakes: [
      {
        title: "Applying to schools that aren't SEVP-certified",
        body: "Non-SEVP schools cannot issue I-20s. You'll get an admission letter but no path to an F-1 visa. You waste the application fee plus 4-8 weeks of your timeline.",
      },
      {
        title: "All-reach, no-safety list",
        body: "Top-20-only lists are how applicants end up with zero admits and have to defer by a year. Always include 4-5 strong-fit safety schools where you're in the top quartile.",
      },
      {
        title: "Ignoring STEM OPT eligibility",
        body: "A non-STEM master's gives you 12 months of post-grad US work. A STEM master's gives you 36 months. Same school, different program — completely different career outcome.",
      },
      {
        title: "Comparing schools by ranking alone, not by program",
        body: "A top-20 school's weak program in your field is a worse choice than a top-100 school's strong, STEM-designated program that matches your career goals. Rankings are university-wide averages — they say almost nothing about the specific department you're actually applying to. Compare programs, not name recognition.",
      },
    ],
    whyItMatters:
      "Your university choice determines which consulate you interview at, when your I-20 arrives, what your STEM OPT trajectory looks like, and what story you can credibly tell the officer about why this specific school. A school you can't justify is a school the officer doesn't approve. The program you enroll in matters as much as the school's name — 'why this university' and 'why this program' are really the same question at the interview window.",
    relatedSteps: [2, 3, 6],
    officialSources: [
      {
        label: "SEVP school finder",
        url: "https://studyinthestates.dhs.gov/school-search",
      },
      {
        label: "STEM-designated programs (DHS)",
        url: "https://www.ice.gov/sevis/stem",
      },
    ],
  },
  {
    number: 2,
    phase: 1,
    phaseName: "Before your I-20",
    phaseDescription: PHASE_DESC[1],
    title: "Take required tests (TOEFL/IELTS, SAT/GRE/GMAT)",
    shortDescription:
      "Register, prep, and take English + standardized tests at least 4 months before your earliest application deadline.",
    estimatedMinutes: 720,
    documentsNeeded: 0,
    isFree: true,
    hasCriticalTip: true,
    instructions: {
      intro:
        "Test scores gate which schools you can credibly apply to. The most expensive mistake here is timing — taking a test after a deadline, or sending scores too late for them to count. Book early and plan for a retake.",
      steps: [
        {
          title: "Pick the tests your shortlist actually requires",
          body:
            "Undergrad → SAT (sometimes optional) + TOEFL/IELTS for non-native English. Master's → GRE for most programs, GMAT for MBA, TOEFL/IELTS for English. Many programs waived GRE post-2020 — check each school's current policy before scheduling.",
        },
        {
          title: "Register 2-3 months ahead in major cities",
          body:
            "TOEFL iBT slots fill 2-3 months out in major cities. GRE has more availability but premium slots still fill. Book the slot BEFORE you start prep — the deadline forces the schedule.",
          link: {
            label: "TOEFL registration (ETS)",
            url: "https://www.ets.org/toefl",
          },
        },
        {
          title: "Plan a retake window before your earliest deadline",
          body:
            "Book the first test at least 8 weeks before your earliest application deadline. Book a tentative retake 4 weeks after that. If the first score is what you want, cancel the retake (most providers refund partially). If not, you have time.",
        },
        {
          title: "Send official score reports — don't just self-report",
          body:
            "ETS and similar providers let you send 4 free 'official' score reports to schools at no extra cost on test day. Use them. Self-reporting in your application is NOT a substitute — admissions decisions require official scores on file before the deadline.",
          link: {
            label: "GRE — sending scores",
            url: "https://www.ets.org/gre",
          },
        },
        {
          title: "Track score validity windows",
          body:
            "TOEFL scores are valid for 2 years from test date. GRE scores are valid for 5 years. IELTS scores are valid for 2 years. GMAT scores are valid for 5 years. If you took a test 18 months ago, check it'll still be valid on your enrollment date.",
        },
      ],
    },
    documents: [],
    commonMistakes: [
      {
        title: "Forgetting to send official score reports to universities",
        body: "Schools won't review your application without official scores from the test provider. Self-reporting in the application form does not count. Admissions decisions are deferred until scores arrive — by which time the deadline has passed.",
      },
      {
        title: "Taking the test after the application deadline",
        body: "If your TOEFL test date is after the deadline, your application is automatically rejected or held for next cycle. Score release takes 7-10 business days on top — bake that in.",
      },
      {
        title: "Assuming GRE is waived without verifying per program",
        body: "Waivers vary by department and by year. Some programs that waived GRE in 2021 reinstated it in 2024. Always verify on the official program page, not third-party forums.",
      },
    ],
    whyItMatters:
      "Test scores decide which schools you can credibly apply to and how much aid you're competitive for. Missing a deadline by a week pushes your entire visa timeline back by 6 months — you don't reapply, you defer.",
    relatedSteps: [1, 3],
    officialSources: [
      { label: "TOEFL (ETS)", url: "https://www.ets.org/toefl" },
      { label: "GRE (ETS)", url: "https://www.ets.org/gre" },
      { label: "GMAT (mba.com)", url: "https://www.mba.com" },
    ],
  },
  {
    number: 3,
    phase: 1,
    phaseName: "Before your I-20",
    phaseDescription: PHASE_DESC[1],
    title: "Submit applications and receive admission",
    shortDescription:
      "Common App for undergrad, direct-to-school for grad. Decisions take 2 weeks to 4 months — apply early, track actively.",
    estimatedMinutes: 960,
    documentsNeeded: 0,
    isFree: true,
    hasCriticalTip: false,
    instructions: {
      intro:
        "Submitting is mechanical work. The trap is treating it as one big task instead of one focused task per school. Each school gets its own SOP framing, its own LOR set, and its own deadline tracker.",
      steps: [
        {
          title: "Pick your portal per school",
          body:
            "Undergrad in the US → Common App handles most, but UC system has its own, MIT has its own, some smaller schools use Coalition. Master's → direct-to-school portals via the graduate admissions page. Never apply through unofficial third-party 'application agents' — schools usually reject these.",
        },
        {
          title: "Write one base SOP, then customize per school",
          body:
            "Write a strong 800-1000 word base statement. For each school, swap the 'why this program' paragraph (2-4 sentences) to name a specific professor, lab, course, or initiative. Admissions readers can spot a generic SOP in 30 seconds — they read thousands a season.",
        },
        {
          title: "Line up 3 LOR writers and give them lead time",
          body:
            "Two academic + one professional is the standard mix. Email each writer 6 weeks before the earliest deadline with: your CV, your draft SOP, the list of schools + deadlines, and a 1-page summary of what you'd like emphasized. Send a reminder 1 week before each deadline.",
        },
        {
          title: "Upload transcripts in the exact format each school requires",
          body:
            "Most accept self-uploaded PDFs at the application stage and require official sealed transcripts only if admitted. A handful require WES or ECE evaluations even for application — verify per school. Use your university's official transcript office; high-school principal-signed copies don't count for US admissions.",
        },
        {
          title: "Track every status weekly until you have all decisions",
          body:
            "Build a simple spreadsheet: school, deadline, submitted-date, status, decision. Check each portal weekly. If you're waitlisted, email the program with a one-paragraph letter of continued interest with one new accomplishment since you applied. Waitlists move into June.",
        },
      ],
    },
    documents: [],
    commonMistakes: [
      {
        title: "Sending the same SOP to every school",
        body: "Generic SOPs are the single most common reason for rejection from schools where your stats were otherwise competitive. Customize the 'why this program' paragraph for every single application.",
      },
      {
        title: "Missing transcript-upload format requirements",
        body: "Some schools want WES-evaluated transcripts at application time. Submitting a raw scan when WES is required = application held until they receive the evaluation, which takes 4-6 weeks. By then, decisions are made.",
      },
      {
        title: "No deadline tracker",
        body: "A school deadline missed by 24 hours is a year of waiting. The CommonApp and graduate portals do not send reminder emails close to deadline — you are responsible.",
      },
    ],
    whyItMatters:
      "Admissions decisions decide which I-20s you'll get and therefore which visa interviews you can book. A missed deadline isn't a setback — it's a year-long defer.",
    relatedSteps: [1, 2, 4, 5],
    officialSources: [
      { label: "Common App", url: "https://www.commonapp.org" },
      { label: "Study in the States — application steps", url: "https://studyinthestates.dhs.gov/students" },
    ],
  },
  {
    number: 4,
    phase: 1,
    phaseName: "Before your I-20",
    phaseDescription: PHASE_DESC[1],
    title: "Compare financial aid packages",
    shortDescription:
      "Read each offer line-by-line: tuition, fees, stipend, housing, insurance. Compare net cost, not sticker price.",
    estimatedMinutes: 120,
    documentsNeeded: 0,
    isFree: true,
    hasCriticalTip: true,
    instructions: {
      intro:
        "Once admits roll in, you'll be comparing offers that look similar on paper but differ by $20-40k a year in real cost. The aid type matters too — assistantships affect what you tell the visa officer about who's paying.",
      steps: [
        {
          title: "Translate every offer into net annual cost",
          body:
            "Build a comparison spreadsheet with: tuition, fees, health insurance, housing estimate, food estimate, books — minus any fellowship, assistantship, or scholarship aid. The number that matters is what your sponsor actually writes a check for each year, not the sticker tuition.",
        },
        {
          title: "Know the aid type — it changes your visa story",
          body:
            "Fellowships = free money. Tuition waivers = free tuition but you still pay living. Assistantships (TA/RA/GA) = waiver + monthly stipend in exchange for 20 hrs/week of work. Loans = debt. The officer will ask 'who's paying?' — your answer must match the aid type on your I-20.",
        },
        {
          title: "Check on-campus employment limits and CPT/OPT",
          body:
            "F-1 students can work on-campus up to 20 hrs/week during the term, 40 hrs in summer. Assistantship hours count toward that limit. CPT (off-campus practical training) is program-by-program — some programs allow it after 1 semester, some only after 1 year.",
        },
        {
          title: "Account for the cost-of-attendance (COA) on the I-20",
          body:
            "Your I-20 will state a COA number. Your financial proof at the visa interview must cover this number for at least year 1, ideally the full program. If your aid covers everything, you still need to show liquid sponsor funds for living expenses.",
        },
        {
          title: "Don't decide on aid amount alone",
          body:
            "A $35k/yr fellowship at a fit-perfect school beats a $50k/yr fellowship at a wrong-fit school. Aid is a tiebreaker, not the only factor. Career outcomes from the program matter more than the size of the aid letter.",
        },
      ],
    },
    documents: [],
    commonMistakes: [
      {
        title: "Comparing tuition only, not living costs",
        body: "Schools in NYC, Boston, and the Bay Area cost $20-30k/yr more in housing alone than schools in the Midwest or South. A 'cheaper tuition' school in an expensive city can cost more than a 'pricier' school in a low-cost city.",
      },
      {
        title: "Not asking the officer-relevant question: who pays?",
        body: "If your aid covers tuition but your parents pay living, the officer expects you to name both numbers. Vague answers about who pays for what trigger 221(g) holds.",
      },
      {
        title: "Treating assistantship hours as optional",
        body: "Assistantships are contracts. If you take an RAship and don't perform the 20 hrs/week, the funding is revoked mid-semester and your I-20 needs reissuing with new funding proof — a months-long mess.",
      },
    ],
    whyItMatters:
      "Aid type and amount become the financial story you tell at the interview. An officer who can't trace who's paying for tuition, housing, and living — to the dollar — will deny you under 214(b).",
    relatedSteps: [3, 5, 11, 30],
    officialSources: [
      {
        label: "F-1 employment overview (Study in the States)",
        url: "https://studyinthestates.dhs.gov/students/work",
      },
    ],
  },
  {
    number: 5,
    phase: 1,
    phaseName: "Before your I-20",
    phaseDescription: PHASE_DESC[1],
    title: "Accept your offer and confirm enrollment",
    shortDescription:
      "Pay the enrollment deposit by the deadline, decline other admits cleanly, lock in your school.",
    estimatedMinutes: 60,
    documentsNeeded: 0,
    isFree: true,
    hasCriticalTip: false,
    instructions: {
      intro:
        "Accepting is a single click but it triggers a chain: the school starts your SEVIS record, queues your I-20, opens housing, and activates your university email. Get the click right and on time.",
      steps: [
        {
          title: "Pay the enrollment deposit before the deadline",
          body:
            "Most undergrad deposits are due by May 1. Master's deposits vary — some are 2 weeks after admit, some are end of May. Missing the deposit deadline forfeits your seat with no appeal. Set a calendar reminder 5 days before.",
        },
        {
          title: "Decline the other admits the same week",
          body:
            "Email the admissions office of every school you're declining. One-paragraph thank-you is enough. This frees up seats for waitlisted students AND ensures your DSO records aren't double-issued (some schools start SEVIS records on admit, not on deposit — declining cancels that).",
        },
        {
          title: "Submit any required pre-arrival financial docs",
          body:
            "Some schools require a Confidential Financial Statement (CFS) with bank statements and a sponsor affidavit before they'll release your I-20. Submit these within 2 weeks of accepting — don't let this become the bottleneck on your I-20 issue.",
        },
        {
          title: "Activate your university email immediately",
          body:
            "Your DSO will send your I-20 (electronic) and all visa-relevant communications to your university email, not your personal one. Set up forwarding to your personal inbox for the first 30 days so you never miss a message.",
        },
        {
          title: "Apply for housing while you wait for the I-20",
          body:
            "Most schools have on-campus housing lotteries that close before the I-20 arrives. Apply now even if you're not sure — you can decline later. Off-campus housing waits until you have the visa, but get the on-campus option locked.",
        },
      ],
    },
    documents: [],
    commonMistakes: [
      {
        title: "Missing the enrollment deposit deadline",
        body: "There's no appeal. Your seat is offered to the next person on the waitlist within 48 hours. You'd have to reapply next year.",
      },
      {
        title: "Forgetting to decline other admits",
        body: "Universities sometimes start your SEVIS record on admit. Not declining can result in multiple active SEVIS records under your name — confusing your visa file and triggering DSO calls during interview prep.",
      },
    ],
    whyItMatters:
      "Accepting is the trigger event for your entire visa timeline. The day you accept is the day the I-20 clock starts. Miss this window and the I-20 is delayed, the SEVIS fee gets delayed, the interview slot you wanted is gone.",
    relatedSteps: [4, 6],
    officialSources: [
      {
        label: "F-1 status maintenance (Study in the States)",
        url: "https://studyinthestates.dhs.gov/students/prepare/maintaining-your-status",
      },
    ],
  },
  {
    number: 6,
    phase: 1,
    phaseName: "Before your I-20",
    phaseDescription: PHASE_DESC[1],
    title: "Receive your I-20 from your university",
    shortDescription:
      "The I-20 is the SEVP-certified school's proof you've been admitted. Verify every field the moment it arrives — never alter it.",
    estimatedMinutes: 30,
    documentsNeeded: 1,
    isFree: true,
    hasCriticalTip: true,
    instructions: {
      intro:
        "The Form I-20 is a federal document. It's the SEVP-certified school's official confirmation that you've been accepted into a specific program with specific funding. Without it, no SEVIS fee, no DS-160, no visa interview.",
      steps: [
        {
          title: "Confirm electronic vs paper delivery with your DSO",
          body:
            "Since 2023, most US schools issue electronic I-20s (PDF with a digital DSO signature) — these are 100% valid for visa applications. A few schools still courier physical I-20s, which takes 5-15 days internationally. Ask your DSO which form yours will be.",
        },
        {
          title: "Verify every field against your passport on day one",
          body:
            "Open the I-20 and check: surname, given name, date of birth, country of birth, country of citizenship, SEVIS ID (starts with 'N'), program start date, program end date, total cost of attendance, source of funding. Compare each to your passport — character by character.",
        },
        {
          title: "Print the I-20 yourself if it's electronic",
          body:
            "Even for electronic I-20s, you'll need a paper copy at the visa interview and at the CBP port of entry. Print on regular paper in color (the DSO signature is colored). Keep the original PDF safe in cloud storage too.",
        },
        {
          title: "Never alter, mark, or fold across the signature",
          body:
            "The I-20 is a federal document. Writing on it, modifying any field, or folding through the SEVIS barcode invalidates it. If you need a correction, request a reissued I-20 from your DSO — never edit it yourself.",
        },
        {
          title: "Plan visa interview timing around the program start date",
          body:
            "You cannot enter the US more than 30 days before the program start date listed on your I-20. Your visa interview can be up to 365 days before, but most students book 60-90 days out. Don't book the interview before the I-20 lands.",
        },
      ],
      outro:
        "If even one field is off — a typo in your name, wrong DOB, wrong SEVIS ID — email your DSO same-day with the I-20 attached and the correction request. Do not pay the SEVIS fee until the corrected I-20 is in your hand.",
    },
    documents: [
      {
        key: "i20_form",
        name: "Form I-20",
        description:
          "The original Form I-20 issued by your SEVP-certified school. Electronic (PDF with digital DSO signature) or paper, both accepted. Must show your name (matching passport), SEVIS ID starting with 'N', program dates, and funding sources.",
      },
    ],
    commonMistakes: [
      {
        title: "Paying the SEVIS fee on an I-20 with an error",
        body: "The SEVIS fee is tied to the SEVIS ID on the I-20. If the I-20 has a name or DOB error and you pay before correction, the fee may not transfer cleanly to the corrected SEVIS record — risking a duplicate $350 fee.",
      },
      {
        title: "Marking, signing, or folding the I-20 incorrectly",
        body: "Only you can sign in the student-signature box on page 1. Any other marks (highlighting, notes, ink stains) make the document invalid for the interview. A folded barcode won't scan at CBP — keep it in a flat envelope.",
      },
      {
        title: "Storing only the original with no backup",
        body: "If you lose the I-20, your DSO can reissue but it takes a week. If you lose it on travel day, you'll be denied boarding. Always keep a printed backup at home and a PDF in cloud storage.",
      },
    ],
    whyItMatters:
      "The I-20 is the document everything else hangs from. SEVIS, DS-160, MRV fee, interview booking, CBP entry — all reference the SEVIS ID on this paper. A single-digit error here cascades into every downstream step.",
    relatedSteps: [5, 7, 8],
    officialSources: [
      { label: "SEVIS overview (ICE)", url: "https://www.ice.gov/sevis" },
      {
        label: "What is the Form I-20? (Study in the States)",
        url: "https://studyinthestates.dhs.gov/students/get-started/students-and-the-form-i-20",
      },
    ],
  },

  // ============================================================
  // PHASE 2 — After I-20 arrival (steps 7-14)
  // ============================================================
  {
    number: 7,
    phase: 2,
    phaseName: "After I-20 arrival",
    phaseDescription: PHASE_DESC[2],
    title: "Verify all I-20 details for accuracy",
    shortDescription:
      "Check name, DOB, SEVIS ID, program dates, tuition, and DSO signature against your passport. One typo voids the document.",
    estimatedMinutes: 30,
    documentsNeeded: 1,
    isFree: false,
    hasCriticalTip: true,
    instructions: {
      intro:
        "Name discrepancy between your I-20 and your passport is the single most common cause of a 221(g) hold at the consulate. Catch it now, request a reissue, and you save weeks of administrative processing later.",
      steps: [
        {
          title: "Compare name spelling character-by-character",
          body:
            "Open your passport bio page next to the I-20. Surname, given name, middle name — every character, every space, every hyphen. A missing middle initial or a 'KUMAR' vs 'Kumar' case mismatch is enough to trigger a name check at the consulate.",
        },
        {
          title: "Verify the SEVIS ID is correct on every page",
          body:
            "The SEVIS ID starts with 'N' followed by 10 digits. It must be identical on page 1, page 2, and page 3 of the I-20. If it differs across pages, the document is invalid — your DSO printed a Frankenstein I-20.",
        },
        {
          title: "Confirm program start and end dates",
          body:
            "The program start date controls when you can enter the US (max 30 days before). The end date affects OPT timing. Dates wrong by even one day need correction — they're hard-coded into your SEVIS record.",
        },
        {
          title: "Check the funding section matches your aid letter",
          body:
            "Total estimated expenses + sources of funding (school funds, personal funds, sponsor) must match what your aid letter promised. If the I-20 says $40k school funds and your letter says $50k, the visa officer's first question will be: 'why the gap?'",
        },
        {
          title: "Verify the DSO signature and date",
          body:
            "The DSO (Designated School Official) signs page 1. The signature must be present and dated within the last 12 months. An unsigned I-20 is not a valid travel document and CBP will deny entry.",
        },
      ],
      outro:
        "Found an error? Email your DSO same-day with the specific field, the correct value, and the I-20 attached. Most DSOs reissue within 3-5 business days. Do not pay the SEVIS fee until the corrected I-20 is in hand.",
    },
    documents: [
      {
        key: "i20_form",
        name: "Form I-20 (verified)",
        description:
          "Your I-20 with every field cross-checked against your passport: name, DOB, SEVIS ID, program dates, funding, DSO signature.",
      },
    ],
    commonMistakes: [
      {
        title: "Trusting the school got it right",
        body: "DSOs handle hundreds of I-20s per cycle. Typos happen. The student who catches the error at home saves the student who catches it at the consulate window — too late.",
      },
      {
        title: "Skipping the cost-of-attendance check",
        body: "If the I-20 lists a COA below what you'll show in bank statements, no problem. If it lists more than you can credibly show — denial. Verify the funding section before the SEVIS fee.",
      },
      {
        title: "Paying SEVIS before correction",
        body: "The $350 SEVIS fee binds to the I-20 SEVIS ID. If the SEVIS ID changes on reissue, you may need to repay. Always verify first.",
      },
    ],
    whyItMatters:
      "A single digit off in your SEVIS ID invalidates your entire application. A misspelled name triggers an automatic security review that delays your case by 3-8 weeks. This 30-minute check prevents the most common 221(g) hold on the planet.",
    relatedSteps: [6, 8],
    officialSources: [
      {
        label: "Form I-20 detail (Study in the States)",
        url: "https://studyinthestates.dhs.gov/students/get-started/students-and-the-form-i-20",
      },
    ],
  },
  {
    number: 8,
    phase: 2,
    phaseName: "After I-20 arrival",
    phaseDescription: PHASE_DESC[2],
    title: "Pay the SEVIS I-901 fee",
    shortDescription:
      "Pay $350 at fmjfee.com — the only official site. Allow 3 business days to process before booking your interview.",
    estimatedMinutes: 20,
    documentsNeeded: 0,
    isFree: false,
    hasCriticalTip: true,
    instructions: {
      intro:
        "The I-901 SEVIS fee funds the system that tracks every F-1 student in the US. It's a one-time $350 payment per program. Pay it at fmjfee.com — anywhere else is a scam.",
      steps: [
        {
          title: "Go to fmjfee.com directly — never Google it",
          body:
            "Phishing sites that clone fmjfee.com show up in search ads regularly. Bookmark fmjfee.com or type it directly. The real site has '.gov'-style trust badges and Department of Homeland Security branding.",
          link: { label: "I-901 SEVIS fee payment", url: "https://www.fmjfee.com" },
        },
        {
          title: "Enter your SEVIS ID exactly as shown on the I-20",
          body:
            "Form I-901 asks for the SEVIS ID, your full name (matching the I-20), date of birth, and country of citizenship. One mismatch and the fee binds to the wrong record — refund process is 6-8 weeks.",
        },
        {
          title: "Pay with a card in your name (or parent's name)",
          body:
            "Credit/debit cards in your own name, or your parent's name if they're the sponsor, are accepted. Third-party cards (friend, uncle, agent) trigger fraud verification and the payment is held. Confirm cardholder name matches a documented payer.",
        },
        {
          title: "Save the digital receipt immediately",
          body:
            "Once paid, the site shows a confirmation page. Download the PDF receipt and email it to yourself in two places. The page also goes to your email — make sure it's not in spam.",
        },
        {
          title: "Wait 3 business days before booking the interview",
          body:
            "The SEVIS system needs 72 hours to mark your record as paid. If you book the interview before the SEVIS record updates, the consulate's system shows 'unpaid' and your interview is auto-cancelled. Wait the 3 days.",
        },
      ],
    },
    documents: [],
    commonMistakes: [
      {
        title: "Paying on a phishing site that mimics fmjfee.com",
        body: "Fake sites take $350 and give nothing — you still owe the real SEVIS fee and you've handed your passport number to fraudsters. Only fmjfee.com. Bookmark it.",
      },
      {
        title: "Booking the visa interview before SEVIS updates",
        body: "Booking before the 72-hour SEVIS sync = appointment cancelled with 'unpaid SEVIS' error. Slots get released back to the pool and the next available date is often weeks later.",
      },
      {
        title: "Wrong cardholder name flagged as fraud",
        body: "Using your friend's card or an unlicensed agent's card triggers fraud verification at the SEVIS payment processor. The fee is held in limbo for 2-4 weeks while you prove the payment source.",
      },
    ],
    whyItMatters:
      "Without a valid SEVIS payment receipt, the consulate cannot process your visa application. Pay wrong, lose the slot. Pay scam, lose $350 and possibly your identity.",
    relatedSteps: [7, 9],
    officialSources: [
      { label: "I-901 SEVIS fee (official)", url: "https://www.fmjfee.com" },
      {
        label: "SEVIS fee guidance (Study in the States)",
        url: "https://studyinthestates.dhs.gov/students/prepare/paying-the-i-901-sevis-fee",
      },
    ],
  },
  {
    number: 9,
    phase: 2,
    phaseName: "After I-20 arrival",
    phaseDescription: PHASE_DESC[2],
    title: "Print SEVIS payment receipt",
    shortDescription:
      "Print 2 paper copies of the I-901 confirmation. Carry one to the interview. Keep one at home. Keep a PDF in cloud.",
    estimatedMinutes: 10,
    documentsNeeded: 1,
    isFree: false,
    hasCriticalTip: true,
    instructions: {
      intro:
        "The SEVIS receipt is on the must-bring list for the visa interview. Missing it means standing in the queue, getting to the window, and being sent home to come back another day. Don't be that person.",
      steps: [
        {
          title: "Download the confirmation page from fmjfee.com",
          body:
            "After payment, fmjfee.com shows a confirmation with: SEVIS ID, payment date, confirmation number, amount paid. Click 'Print' and save as PDF. If you missed the page, log back in with your SEVIS ID and DOB to retrieve.",
        },
        {
          title: "Print two physical copies on plain white paper",
          body:
            "One copy for your interview folder. One copy stored at home as backup. Black-and-white is fine — the receipt has no photo, just text and barcodes that read clearly in B&W.",
        },
        {
          title: "Store the PDF in two cloud locations",
          body:
            "Google Drive + Dropbox is overkill but safe. The night before the interview you might want to pull the PDF on your phone to email a digital copy to yourself — having two cloud copies means no panic if one fails.",
        },
        {
          title: "Verify the confirmation shows the right SEVIS ID",
          body:
            "The receipt must show the SEVIS ID from YOUR I-20. If the SEVIS ID on the receipt is different from your I-20, the fee was applied to someone else's record — contact fmjfee.com support immediately.",
        },
      ],
    },
    documents: [
      {
        key: "sevis_receipt",
        name: "SEVIS I-901 payment receipt",
        description:
          "Paper printout of the I-901 confirmation page showing your name, SEVIS ID, payment date, and confirmation number. Two physical copies recommended; keep a PDF in cloud.",
      },
    ],
    commonMistakes: [
      {
        title: "Bringing a screenshot instead of the printed receipt",
        body: "Consulate officers want the printed confirmation page, not a phone screenshot. 'I have it on my phone' gets you sent away to print.",
      },
      {
        title: "Bringing the wrong page from fmjfee.com",
        body: "The payment confirmation is page 1 with the SEVIS ID and confirmation number. The session-summary page does not count. Print the right one.",
      },
    ],
    whyItMatters:
      "This is a required interview document. Officers at most consulates check the SEVIS receipt as part of the document handoff before asking the first question. No receipt = no interview today.",
    relatedSteps: [8, 27, 39],
    officialSources: [
      { label: "I-901 SEVIS receipt portal", url: "https://www.fmjfee.com" },
    ],
  },
  {
    number: 10,
    phase: 2,
    phaseName: "After I-20 arrival",
    phaseDescription: PHASE_DESC[2],
    title: "Gather passport and identity documents",
    shortDescription:
      "Passport valid 6+ months past program end. Bring any old passports with US visas. Photo specs matter.",
    estimatedMinutes: 60,
    documentsNeeded: 3,
    isFree: false,
    hasCriticalTip: true,
    instructions: {
      intro:
        "Passport validity is a hard requirement, not a guideline. The State Department requires 6 months beyond your program end date — if yours is shorter, renew before doing anything else.",
      steps: [
        {
          title: "Calculate passport validity against your I-20 end date",
          body:
            "Take your I-20 program end date. Add 6 months. If your passport expires before that date, you must renew BEFORE the visa interview. A short-validity passport gets the visa stamped for fewer months, sometimes single-entry only.",
        },
        {
          title: "Renew immediately if expiring within 12 months",
          body:
            "Passport renewal timelines vary widely by country — some offer an expedited service for an extra fee. Check your home country's process now. If your passport expires within a year, renew now — going to the interview with a fresh passport is far better than carrying both.",
        },
        {
          title: "Locate every old passport with US visas",
          body:
            "If you've held US visas before (B1/B2 tourist, J1 exchange, etc.), bring the old passport to the interview. Officers check visa history. 'Lost it' is a non-answer — start hunting now, not the day before.",
        },
        {
          title: "Pull a clean national ID for backup",
          body:
            "A national ID card, or driver's license — bring one as secondary identity proof. Some consulates ask, most don't, but it's a one-minute prep.",
        },
        {
          title: "Take photos meeting US State Dept specs",
          body:
            "2x2 inches, white background, taken within last 6 months, no glasses, no smile, no head covering except religious. Many local photo studios don't know US visa photo specs — show them the official spec sheet before paying.",
          link: {
            label: "US visa photo requirements",
            url: "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/photos.html",
          },
        },
      ],
    },
    documents: [
      {
        key: "passport_current",
        name: "Current passport",
        description:
          "Original passport, valid at least 6 months beyond your I-20 program end date. Must have 2+ blank visa pages for the F-1 stamp.",
        expiryRelevant: true,
      },
      {
        key: "passport_old",
        name: "Old passports (if any contain US visas)",
        description:
          "Any expired passports containing prior US visas (B1/B2, J1, F-1, etc). Bring originals — copies aren't enough.",
      },
      {
        key: "national_id",
        name: "National ID or driver's license",
        description:
          "Secondary identity proof. National ID card or country-issued driver's license. Original or attested copy.",
      },
    ],
    commonMistakes: [
      {
        title: "Going to the interview with a passport expiring soon",
        body: "Short-validity passports trigger automatic administrative processing. The visa may be issued for only the months your passport is valid, not the full program — forcing you to apply for a visa renewal during your degree.",
      },
      {
        title: "Forgetting old passports with prior US visas",
        body: "Officers ask about prior US travel. 'I don't have the old passport' looks like you're hiding history. Even refused visas must be disclosed — refused visas in old passports are a known consular red flag if undisclosed.",
      },
      {
        title: "Wrong photo specs",
        body: "Sub-spec photos cause DS-160 upload failures and at the worst case, an interview reschedule. Take the photo at a studio that knows US specs OR get it taken at a US Visa Application Center photo booth.",
      },
    ],
    whyItMatters:
      "Identity documents are the first thing the officer checks. A passport that doesn't meet validity rules, photos that don't meet specs, or missing old passports all delay or deny your application. This is the easiest 60 minutes you'll spend in the entire process.",
    relatedSteps: [11, 14, 20],
    officialSources: [
      {
        label: "US visa photo specs (Travel.State.Gov)",
        url: "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/photos.html",
      },
      {
        label: "F-1 visa overview (Travel.State.Gov)",
        url: "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html",
      },
    ],
  },
  {
    number: 11,
    phase: 2,
    phaseName: "After I-20 arrival",
    phaseDescription: PHASE_DESC[2],
    title: "Compile financial proof documents",
    shortDescription:
      "3-6 months of bank statements, sponsor letter, ITRs, scholarship letters. Steady balances, not last-week deposits.",
    estimatedMinutes: 120,
    documentsNeeded: 4,
    isFree: false,
    hasCriticalTip: true,
    instructions: {
      intro:
        "Financial proof is the second most-scrutinized element of your F-1 application after ties to home. Officers want to see that you can pay for at least year 1, and that the money has been with the sponsor — not parked there last Tuesday.",
      steps: [
        {
          title: "Pull bank statements for the last 3-6 months",
          body:
            "Bank statements should show consistent or growing balances across 3-6 months. A flat-line balance at exactly the cost-of-attendance, deposited 2 weeks ago, looks like a borrowed-money setup. Officers trained on this exact pattern.",
        },
        {
          title: "Cover the full year-1 cost of attendance",
          body:
            "Pull the COA from your I-20. Your sponsor's liquid funds must show at least that number for year 1, preferably 110-120% to cover unexpected expenses. If the program is 2 years, showing funds for both years is stronger.",
        },
        {
          title: "Get a sponsor letter on the right letterhead",
          body:
            "If parents/relatives are sponsoring, get a letter on plain paper (or business letterhead if self-employed) stating: relationship to you, total support amount in USD, income source, and signed/dated. Notarized is stronger but not required.",
        },
        {
          title: "Collect the sponsor's income proof",
          body:
            "Sponsor needs to show how they fund the commitment. Salaried: last 3 salary slips + last 2 years ITRs. Business owner: last 3 years ITRs + business registration + CA certificate of net worth. Both: include both.",
        },
        {
          title: "Pull scholarship/fellowship/assistantship award letters",
          body:
            "If part of your funding is from the school, include the official award letter from the financial aid office. The letter must specify amount, duration, and any conditions (TA/RA hours, GPA threshold).",
        },
      ],
      outro:
        "Avoid one specific pattern: a single large deposit a few weeks before the interview. Officers see this as 'borrowed funds' — a friend or relative transferred money temporarily to inflate the balance. Even if the funds are real, the pattern is a red flag.",
    },
    documents: [
      {
        key: "bank_statements",
        name: "Bank statements (3-6 months)",
        description:
          "Sponsor's bank statements for the most recent 3-6 months. Original printed copies or bank-stamped statements. Should show steady or growing balances, not a sudden large deposit.",
        expiryRelevant: true,
      },
      {
        key: "sponsor_letter",
        name: "Sponsor affidavit / support letter",
        description:
          "Written statement from the sponsor (parent, relative, employer) confirming relationship, support amount in USD, income source. Signed and dated. Notarization optional but stronger.",
      },
      {
        key: "income_proof",
        name: "Sponsor income proof",
        description:
          "Salaried sponsor: last 3 salary slips + last 2 years ITRs. Business-owner sponsor: last 3 years ITRs + business registration + CA-certified net-worth statement.",
      },
      {
        key: "award_letter",
        name: "Scholarship/assistantship letter (if applicable)",
        description:
          "Official letter from the university's financial aid office stating award type, amount, duration, and any conditions (work hours, GPA threshold). Required only if you have school funding.",
      },
    ],
    commonMistakes: [
      {
        title: "One large deposit before the interview",
        body: "A sudden $50k deposit 2 weeks pre-interview looks like borrowed funds. Officers see this pattern daily and deny under 214(b). Real savings show consistent balance over 3-6 months.",
      },
      {
        title: "Funds below cost-of-attendance",
        body: "If your statements show less than the year-1 COA on the I-20, the officer flags 'insufficient funds.' Bring funds equal to 110-120% of COA to cushion any conversion or interpretation questions.",
      },
      {
        title: "Sponsor letter with vague support amount",
        body: "Letters saying 'I will support my child's education' without a specific USD number are useless. The letter must name the dollar amount and the source.",
      },
      {
        title: "Missing the sponsor's income proof",
        body: "A sponsor letter without ITRs or salary slips is unverifiable. Officers ask 'what does your father do?' — without paperwork, your verbal answer doesn't back up the claim.",
      },
    ],
    whyItMatters:
      "Financial proof is checked even before you reach the window. The officer's tablet shows your DS-160 financial section; the documents you hand over either confirm or contradict it. Contradictions = denial.",
    relatedSteps: [4, 12, 30],
    officialSources: [
      {
        label: "F-1 visa financial requirements (Travel.State.Gov)",
        url: "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html",
      },
    ],
  },
  {
    number: 12,
    phase: 2,
    phaseName: "After I-20 arrival",
    phaseDescription: PHASE_DESC[2],
    title: "Organize academic transcripts and certificates",
    shortDescription:
      "Latest transcripts, degree certificate, 10th/12th mark sheets. Originals + attested copies. English translations if needed.",
    estimatedMinutes: 90,
    documentsNeeded: 3,
    isFree: false,
    hasCriticalTip: false,
    instructions: {
      intro:
        "Academic documents prove the qualifications your admission was based on. Most consulates don't ask for them — but high-volume STEM consulates that do expect them in a clean stack.",
      steps: [
        {
          title: "Pull official transcripts from your most recent institution",
          body:
            "From your current university's transcript office: 2 original sealed-envelope transcripts plus 2 attested copies. Sealed transcripts can be opened by you for the interview — the seal doesn't have to be intact for visa purposes.",
        },
        {
          title: "Bring degree certificates for completed degrees",
          body:
            "Bachelor's degree certificate (if applying for master's), provisional + final. Original + 2 attested copies. If still studying for bachelor's, bring a bonafide letter from your university stating expected graduation date.",
        },
        {
          title: "Include school mark sheets if you're early-career",
          body:
            "10th + 12th mark sheets if you're applying within 5 years of school. Officers occasionally check the educational continuity from school to college to master's. Older applicants (5+ years post-bachelor's) skip this.",
        },
        {
          title: "Get English translations if needed",
          body:
            "Documents in any language other than English need certified translations attached. Use a sworn translator or your university's official translation office. DIY translations are not accepted.",
        },
        {
          title: "WES/ECE evaluation is NOT needed for the visa",
          body:
            "WES/ECE evaluations are required by some US universities at the admission stage only. They are not a US visa requirement. If your university didn't need one, you don't need to get one for the visa.",
        },
      ],
    },
    documents: [
      {
        key: "transcripts",
        name: "Official academic transcripts",
        description:
          "Latest semester/year transcripts from your most recent institution. Sealed originals + attested copies preferred. Translated to English if originals aren't.",
      },
      {
        key: "degree_certificate",
        name: "Degree certificate",
        description:
          "Bachelor's degree certificate (provisional or final). Original + 2 attested copies. If still studying, a bonafide letter from your current institution stating expected graduation.",
      },
      {
        key: "school_marksheets",
        name: "10th & 12th mark sheets",
        description:
          "Original 10th + 12th mark sheets. Required if you graduated bachelor's within last 5 years. Originals + attested copies.",
      },
    ],
    commonMistakes: [
      {
        title: "Bringing only photocopies, no originals",
        body: "If the officer asks to see academic documents, photocopies without originals raise authenticity concerns. Bring originals every time.",
      },
      {
        title: "Forgetting English translations for non-English docs",
        body: "Non-English documents need certified English translations. Without them, the officer can't read your credentials — even if the document is genuine.",
      },
    ],
    whyItMatters:
      "Academic documents back up your DS-160 education section and your admission claim. Discrepancies between your DS-160 (dates, schools) and transcripts trigger verification holds.",
    relatedSteps: [3, 18],
    officialSources: [
      {
        label: "Required documents (Travel.State.Gov)",
        url: "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html",
      },
    ],
  },
  {
    number: 13,
    phase: 2,
    phaseName: "After I-20 arrival",
    phaseDescription: PHASE_DESC[2],
    title: "Prepare ties-to-home-country evidence",
    shortDescription:
      "Documents that prove you'll come back: property, signed offer letter, family business, dependent parents. Real, not fabricated.",
    estimatedMinutes: 180,
    documentsNeeded: 3,
    isFree: false,
    hasCriticalTip: true,
    instructions: {
      intro:
        "The F-1 visa exists under Section 214(b): you're presumed to be an intending immigrant until you prove otherwise. Ties to your home country are how you prove otherwise. This is the most-tested element of every F-1 interview.",
      steps: [
        {
          title: "Understand the hierarchy of ties evidence",
          body:
            "Strongest: signed post-graduation job offer from a home-country employer (Tata, Infosys, family business). Strong: property ownership in your name or family's. Mid: dependent parents, family business registration, sibling care responsibilities. Weak: 'I plan to return' verbal intent.",
        },
        {
          title: "Gather property documents (if applicable)",
          body:
            "Sale deeds, property tax receipts, ownership registrations in your name or parents' name. Property tied to your family creates a financial anchor in your home country. Original or notarized copies.",
        },
        {
          title: "Get a family business registration document (if applicable)",
          body:
            "If your family runs a business and you're expected to join, bring the business registration, partnership deed, or company-incorporation documents naming the family. This is among the strongest student-applicant ties.",
        },
        {
          title: "Pull any signed post-grad job offers",
          body:
            "If you've already been recruited by a home-country employer for after the degree (common for MBA, MS Finance, MS Eng), bring the signed offer letter on company letterhead. This is the single strongest tie evidence you can show.",
        },
        {
          title: "Document family dependency",
          body:
            "If you're the sole/eldest child of dependent parents, sibling needing care, etc., bring documentary evidence — parents' medical records, family photos, or written declaration. These are mid-strength but cumulative.",
        },
      ],
      outro:
        "Whatever you bring must be real and verifiable. Fabricated ties (fake property docs, fake job offers) trigger permanent visa bars under 212(a)(6)(C) — fraud. Even if you 'pass' the interview, the discovery later is catastrophic. Don't.",
    },
    documents: [
      {
        key: "property_docs",
        name: "Property ownership documents (if applicable)",
        description:
          "Sale deeds, property tax receipts, or ownership registrations in your name or family's. Original or notarized copies.",
      },
      {
        key: "family_business",
        name: "Family business registration (if applicable)",
        description:
          "Business incorporation, partnership deed, or registration document showing family ownership of an active enterprise you'd join post-graduation.",
      },
      {
        key: "job_offer_home",
        name: "Post-graduation job offer in home country (if applicable)",
        description:
          "Signed offer letter on company letterhead, dated and addressed to you, stating start date after your program end date.",
      },
    ],
    commonMistakes: [
      {
        title: "Verbal intent only, no documents",
        body: "Saying 'I plan to come back' without any document to back it up is the weakest possible answer. Officers reject this under 214(b) routinely.",
      },
      {
        title: "Fabricated ties (fake property, fake offer)",
        body: "Submitting fake documents is fraud under 212(a)(6)(C). Result: permanent visa ineligibility. The consulate verifies high-suspicion claims directly with employers and registrars.",
      },
      {
        title: "Misjudging which ties are 'strong' for your profile",
        body: "Owning a home is a strong tie for some applicants and weak for others (depends on stage of career). Don't pad weak ties — present the strongest 2-3 that fit your real life.",
      },
    ],
    whyItMatters:
      "214(b) — non-immigrant intent — is the single most-cited reason for F-1 denial. Ties evidence is the only counter. Without verifiable home-country anchors, your interview is a coin flip.",
    relatedSteps: [31, 32, 41],
    officialSources: [
      {
        label: "INA 214(b) overview (Travel.State.Gov)",
        url: "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/visa-denials.html",
      },
    ],
  },
  {
    number: 14,
    phase: 2,
    phaseName: "After I-20 arrival",
    phaseDescription: PHASE_DESC[2],
    title: "Get passport-sized photos meeting US specs",
    shortDescription:
      "2x2 inch, white background, less than 6 months old, no glasses. Take 4-6 prints + digital JPEG under 240KB.",
    estimatedMinutes: 30,
    documentsNeeded: 1,
    isFree: false,
    hasCriticalTip: true,
    instructions: {
      intro:
        "US visa photos are NOT the same as your home country's standard passport photos. Different aspect ratio, different head-size rules, different background requirements. Most studios get it wrong unless you show them the spec.",
      steps: [
        {
          title: "Take the photo at a US-spec-aware studio",
          body:
            "VFS Global photo booths, US Visa Application Centers, or studios advertising 'US visa photo' are safe. Otherwise: show the photographer the State Department spec sheet and verify head-size before paying.",
          link: {
            label: "US visa photo specs (with examples)",
            url: "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/photos.html",
          },
        },
        {
          title: "Verify all the specs before leaving",
          body:
            "Size: 2x2 inches (51x51 mm). Background: white. Date: within 6 months. Expression: neutral, mouth closed. No glasses (since 2016). No headwear except religious. Head size: 50-69% of frame height.",
        },
        {
          title: "Get the digital JPEG too",
          body:
            "Most studios print AND email the JPEG. Verify: JPEG, under 240KB, square 1:1 aspect, between 600x600 and 1200x1200 pixels. This is what you upload to the DS-160.",
        },
        {
          title: "Take 4-6 prints",
          body:
            "2 for the visa interview folder. 2 spare in case the first set gets damaged or the officer keeps one. 1-2 for arrival day at the airport. Photos cost almost nothing — more is safer.",
        },
        {
          title: "Test the JPEG using the State Dept photo tool",
          body:
            "Before uploading to DS-160, run the JPEG through the official State Dept photo tool. It checks specs and warns of issues. Catches problems before they cause a DS-160 submission error.",
          link: {
            label: "Photo composition test",
            url: "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/photos/photo-composition-template.html",
          },
        },
      ],
    },
    documents: [
      {
        key: "visa_photos",
        name: "US visa photos (4-6 prints + digital)",
        description:
          "2x2 inch photos with white background, taken within the last 6 months, no glasses. JPEG version: under 240KB, square 1:1 aspect. Take 4-6 printed copies.",
        expiryRelevant: true,
      },
    ],
    commonMistakes: [
      {
        title: "Wrong dimensions (home-country passport size instead of US)",
        body: "Many countries' passport photos use different dimensions than the US standard. US visa photos are 51x51mm (2x2 inches). Wrong size = photo rejected at the consulate window OR DS-160 upload failure.",
      },
      {
        title: "Wearing glasses in the photo",
        body: "Glasses banned since November 2016. Photos with glasses fail the DS-160 photo check and need re-shooting.",
      },
      {
        title: "Background not pure white",
        body: "Light blue, cream, or off-white backgrounds get flagged. Photo must be on pure white — the State Dept's automated tool catches non-white backgrounds.",
      },
      {
        title: "JPEG too large or wrong dimensions",
        body: "DS-160 requires JPEG under 240KB at specific pixel sizes. Studios sometimes send 5MB files — the upload fails silently or rejects the form.",
      },
    ],
    whyItMatters:
      "A wrong-spec photo blocks the DS-160 submission, sometimes silently. Students discover the photo issue at the consulate window when the officer says 'this photo doesn't meet specs' and reschedules — costing weeks.",
    relatedSteps: [10, 20],
    officialSources: [
      {
        label: "US visa photo requirements",
        url: "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/photos.html",
      },
      {
        label: "Photo composition test tool",
        url: "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/photos/photo-composition-template.html",
      },
    ],
  },

  // ============================================================
  // PHASE 3 — DS-160 and fees (steps 15-26)
  // ============================================================
  {
    number: 15,
    phase: 3,
    phaseName: "DS-160 and fees",
    phaseDescription: PHASE_DESC[3],
    title: "Create CEAC account",
    shortDescription:
      "Go directly to ceac.state.gov, start a Nonimmigrant Visa application, save your Application ID immediately.",
    estimatedMinutes: 15,
    documentsNeeded: 0,
    isFree: false,
    hasCriticalTip: true,
    instructions: {
      intro:
        "The Consular Electronic Application Center (CEAC) is where you fill out the DS-160. The DS-160 has 91 fields across 17 sessions. Lose your Application ID midway and you start from scratch.",
      steps: [
        {
          title: "Type ceac.state.gov directly — don't Google",
          body:
            "Phishing sites mimicking ceac.state.gov rank in ads. Bookmark the real URL or type it. The State Department site has 'TRAVEL.STATE.GOV' branding and an HTTPS lock with U.S. Department of State as the issuer.",
          link: { label: "CEAC (official)", url: "https://ceac.state.gov" },
        },
        {
          title: "Click 'Apply for a Nonimmigrant Visa'",
          body:
            "On the CEAC homepage, choose 'Apply for a Nonimmigrant Visa' (NOT immigrant). The next screen asks you to pick a 'Location' — choose the country where you'll have your interview. This locks consulate-specific fields in the form.",
        },
        {
          title: "Save the 10-character Application ID immediately",
          body:
            "The first screen shows an Application ID (format: AAxxxxxxxx). Write it down, screenshot it, email it to yourself. Without this ID + your DOB + the security question, you cannot resume the application later.",
        },
        {
          title: "Pick a security question you'll actually remember",
          body:
            "You'll need the answer to log back in. 'Your favorite teacher' is fine if it's stable; obscure ones cause lockouts. Note the exact spelling — case-sensitive.",
        },
        {
          title: "Plan around the 20-minute session timeout",
          body:
            "CEAC logs you out after 20 minutes of inactivity. Click 'Save' at the bottom of every page. You can save and resume across days — but only if you have the Application ID + security answer.",
        },
      ],
    },
    documents: [],
    commonMistakes: [
      {
        title: "Losing the Application ID",
        body: "Without the Application ID, you cannot resume an in-progress DS-160. You restart from scratch — 91 fields, 2-3 hours of work lost.",
      },
      {
        title: "Choosing the wrong consulate location",
        body: "The location set at account creation determines which consulate-specific fields appear and where the application is filed. Wrong location = wrong consulate = potential retake of the application.",
      },
      {
        title: "Filling out the form on a phishing copy",
        body: "Fake CEAC sites collect your passport number, name, DOB, and credit card. Only ceac.state.gov is real.",
      },
    ],
    whyItMatters:
      "The CEAC account is the gateway to the DS-160. A poorly-managed account (lost ID, wrong location) costs hours and sometimes forces a complete restart. Five minutes of careful setup saves a week.",
    relatedSteps: [16, 21],
    officialSources: [
      { label: "CEAC (official)", url: "https://ceac.state.gov" },
    ],
  },
  {
    number: 16,
    phase: 3,
    phaseName: "DS-160 and fees",
    phaseDescription: PHASE_DESC[3],
    title: "Begin DS-160 — personal information",
    shortDescription:
      "Name (matching passport exactly), DOB, nationality, sex, marital status. The most-checked section by name-screening systems.",
    estimatedMinutes: 45,
    documentsNeeded: 2,
    isFree: false,
    hasCriticalTip: true,
    instructions: {
      intro:
        "Section 1 of the DS-160 is where most 221(g) name-check holds originate. The data here gets cross-referenced against State Department databases for security screening. Match your passport exactly.",
      steps: [
        {
          title: "Surname = SURNAME on passport, exactly",
          body:
            "Copy from the passport bio page character-by-character, matching capitalization exactly. If your passport's surname field is empty (common in some naming conventions where only a given name is used), enter 'FNU' (First Name Unknown) per State Dept guidance.",
        },
        {
          title: "Given names = all given names, all of them",
          body:
            "Multiple given names (first + middle + others) all go in 'Given Names'. If your passport has 'NARENDRA KUMAR' as given names, both go in — 'NARENDRA KUMAR'. Skipping the middle name = mismatch = 221(g).",
        },
        {
          title: "Disclose every other name you've ever used",
          body:
            "Maiden name, nicknames in official documents, religious names — anything that's appeared on an ID, marriage cert, birth cert. Undisclosed alternate names found during screening = fraud flag.",
        },
        {
          title: "Nationality and other nationalities",
          body:
            "Primary citizenship + any second citizenships. Dual citizens of US (uncommon) or other countries declare both. Omitting a second citizenship is fraud under INA 212(a)(6)(C).",
        },
        {
          title: "Physical description in US units",
          body:
            "Height in feet/inches, not centimeters. Weight in pounds, not kilograms. Eye color, hair color. Be honest — these are descriptors, not deal-breakers, but lies are flags.",
        },
      ],
      outro:
        "After this section, click Save and Next. The form auto-saves on Next; abandoning mid-page loses the page. Open your passport beside your laptop — never type from memory.",
    },
    documents: [
      {
        key: "passport_current",
        name: "Current passport (bio page)",
        description: "Reference for exact name spelling, DOB, passport number.",
      },
      {
        key: "national_id",
        name: "National ID",
        description: "Reference for national ID number field on the DS-160.",
      },
    ],
    commonMistakes: [
      {
        title: "Surname/given name mismatch with passport",
        body: "Misspelling your name or splitting it differently from the passport triggers automatic 221(g) name-check holds — typical delay 3-8 weeks.",
      },
      {
        title: "Omitting middle names that appear on passport",
        body: "Passport: 'NARENDRA KUMAR'. DS-160 only: 'NARENDRA'. Result: name mismatch flag, manual review, delays.",
      },
      {
        title: "Not disclosing other names (maiden, religious, etc.)",
        body: "If a background check turns up a name you've used officially elsewhere, undisclosed = fraud under 212(a)(6)(C). Permanent ineligibility.",
      },
    ],
    whyItMatters:
      "Name spelling is the #1 cause of 221(g) administrative processing in F-1 cases. The officer reads your DS-160 before you arrive at the window — a name mismatch starts the interview already skeptical.",
    relatedSteps: [10, 17, 21],
    officialSources: [
      {
        label: "DS-160 instructions (Travel.State.Gov)",
        url: "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/forms/about-ds-160-online-nonimmigrant-visa-application.html",
      },
    ],
  },
  {
    number: 17,
    phase: 3,
    phaseName: "DS-160 and fees",
    phaseDescription: PHASE_DESC[3],
    title: "Complete travel and US contact sections",
    shortDescription:
      "Trip purpose (F-1 study), US address, US point of contact, all prior US travel + ALL prior visa refusals from any country.",
    estimatedMinutes: 30,
    documentsNeeded: 0,
    isFree: false,
    hasCriticalTip: true,
    instructions: {
      intro:
        "This section asks where you'll live in the US, who your US contact is, and your full visa history with the US and other countries. Undisclosed prior refusals are the second-most-common cause of permanent ineligibility.",
      steps: [
        {
          title: "Purpose of trip: STUDENT (Academic) F-1",
          body:
            "Select 'STUDENT (ACADEMIC) (F-1)'. Don't choose F-2 (that's for dependents). The principal applicant field is YOU.",
        },
        {
          title: "Intended date of arrival",
          body:
            "Enter a date no more than 30 days before your I-20 program start date. CBP enforces the 30-day rule strictly — even if your visa allows entry earlier, you'll be refused at the airport.",
        },
        {
          title: "Address while in the US",
          body:
            "Use your university's official international office address for the first 30 days if you don't have housing locked. Format: street, city, state, ZIP. Check the university page for the exact format.",
        },
        {
          title: "US point of contact: international office, not a friend",
          body:
            "Name the international student office at your university with their phone number. 'My friend who lives in the US' creates immigrant-intent concerns. The official school office is the right answer.",
        },
        {
          title: "Disclose ALL prior US travel and ALL prior visa refusals",
          body:
            "Every prior US entry, every visa application (approved or denied), every refusal from any country — disclose. The State Department shares refusal data with Canada, Schengen countries, UK, Australia, NZ. Omitting = fraud.",
        },
      ],
    },
    documents: [],
    commonMistakes: [
      {
        title: "Friend or relative as US contact",
        body: "Using a US-citizen friend or relative as 'point of contact' signals immigrant intent — like you have a place to land permanently. Use the school's international office.",
      },
      {
        title: "Hiding a prior visa refusal (US or other country)",
        body: "Refusals are shared internationally. A 2019 Canadian visa denial that you didn't disclose on the DS-160 = found during US screening = INA 212(a)(6)(C) fraud bar.",
      },
      {
        title: "Intended arrival date more than 30 days before program start",
        body: "Even if the DS-160 accepts the date, CBP refuses entry on arrival. You bought a one-way ticket and CBP sends you home.",
      },
    ],
    whyItMatters:
      "Undisclosed refusals are the second-most-common reason for permanent visa ineligibility. Even refusals from 10 years ago, from countries you barely remember — disclose. The system already knows; the question tests your honesty.",
    relatedSteps: [16, 18, 21],
    officialSources: [
      {
        label: "Visa denial overview (Travel.State.Gov)",
        url: "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/visa-denials.html",
      },
    ],
  },
  {
    number: 18,
    phase: 3,
    phaseName: "DS-160 and fees",
    phaseDescription: PHASE_DESC[3],
    title: "Fill family and education sections",
    shortDescription:
      "Parents' full names + DOBs + birthplaces, siblings, every school attended with exact start/end dates that match transcripts.",
    estimatedMinutes: 40,
    documentsNeeded: 1,
    isFree: false,
    hasCriticalTip: false,
    instructions: {
      intro:
        "The family + education section is the cross-check zone. Officers verify that the dates you list match your transcripts, that your parents' details match their identity, and that your siblings' US status is disclosed.",
      steps: [
        {
          title: "Parents: full names matching their IDs",
          body:
            "Father's full name (matching his passport or national ID), date of birth, country of birth. Same for mother. If a parent is deceased, indicate that — there's a separate option.",
        },
        {
          title: "Parents' US status — full disclosure",
          body:
            "Are either of your parents in the US legally? Are they US citizens or LPRs? Have they ever held a US visa? Answer truthfully — relatives with US status affects your application but doesn't disqualify you. Lying does.",
        },
        {
          title: "Siblings: count, ages, US status of each",
          body:
            "Number of siblings, their ages, and whether any are in the US (status: F-1 student, H-1B worker, green card, citizen). This is asked because relatives in the US can be a factor in non-immigrant intent assessment.",
        },
        {
          title: "Education: every school with exact dates",
          body:
            "List every educational institution from secondary school onward. Exact month/year of start and end. These dates must match your transcripts character-for-character — the officer can pull your transcripts at the window.",
        },
        {
          title: "Current education program",
          body:
            "Name of the US school (matching the I-20), degree program, course of study, expected graduation date. Pull these directly from the I-20 — don't paraphrase.",
        },
      ],
    },
    documents: [
      {
        key: "transcripts_reference",
        name: "Transcripts (for reference)",
        description:
          "Used while filling DS-160 to ensure education start/end dates match transcripts exactly. Mismatches trigger verification.",
      },
    ],
    commonMistakes: [
      {
        title: "Education dates inconsistent with transcripts",
        body: "DS-160 says you graduated June 2023; transcript says May 2023. The officer notices. The 1-month gap raises a 'is this person who they say they are?' flag.",
      },
      {
        title: "Hiding siblings in the US",
        body: "If your brother is on F-1 and you don't disclose, the officer's tablet shows two F-1 records under the same family name. Caught. Result: 214(b) for intent + potential fraud flag.",
      },
    ],
    whyItMatters:
      "This section is verification-bait. The dates you list are cross-checked against your transcripts and your relatives' records. Inconsistencies cause delays even if they're unintentional.",
    relatedSteps: [12, 17, 21],
    officialSources: [
      {
        label: "DS-160 overview (Travel.State.Gov)",
        url: "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/forms/about-ds-160-online-nonimmigrant-visa-application.html",
      },
    ],
  },
  {
    number: 19,
    phase: 3,
    phaseName: "DS-160 and fees",
    phaseDescription: PHASE_DESC[3],
    title: "Complete work, training, and security sections",
    shortDescription:
      "Every job ever held with exact dates. Security questions answered honestly — they cross-reference government databases.",
    estimatedMinutes: 60,
    documentsNeeded: 0,
    isFree: false,
    hasCriticalTip: true,
    instructions: {
      intro:
        "This is the most security-sensitive section of the DS-160. Lying here isn't a 221(g) hold — it's a federal crime under 18 USC 1546 and the form states that explicitly. Honesty is mandatory.",
      steps: [
        {
          title: "List your present and previous employers",
          body:
            "If currently employed: present employer's name, address, phone, your job title, monthly salary, brief description of duties. If unemployed/student, that's fine — say so honestly.",
        },
        {
          title: "Previous employment: every job in the last 5 years",
          body:
            "Name, address, dates (month/year start + end), salary, supervisor, brief description. Internships count. Family business work counts. Gaps must be explainable.",
        },
        {
          title: "Specialized skills, training, military service",
          body:
            "Specialized training in firearms, explosives, nuclear, chemical, biological, missile — answer honestly. Military service in any country — declare it. Most students answer 'No' to all.",
        },
        {
          title: "Security questions — read every word",
          body:
            "Have you ever been involved in trafficking, terrorism, money laundering, human rights violations, sex trafficking, child abduction, child solicitation? These questions are screening against international databases — 'Yes' to any with explanation is better than undisclosed.",
        },
        {
          title: "Have you ever been refused a visa, denied entry, or detained?",
          body:
            "Disclose every prior visa refusal from any country, every airport denial of entry, any past detention. Even minor refusals from years ago must be declared. The form is clear: omission is fraud.",
        },
      ],
      outro:
        "Lying on the DS-160 is a federal crime — the form prints this in its certification. Honest answers, including 'Yes' to a refusal that has explanation, are far better than undisclosed history that's found during screening.",
    },
    documents: [],
    commonMistakes: [
      {
        title: "Lying on security questions to seem 'clean'",
        body: "Cross-referenced against FBI, Interpol, and partner-country databases. Detected = permanent ineligibility under 212(a)(6)(C). 'Yes with explanation' is usually fine; 'No' when 'Yes' is true is catastrophic.",
      },
      {
        title: "Forgetting a job from 4 years ago",
        body: "If you have a 6-month internship in your work history that you skipped, it can surface during employer verification. Gap = officer asks 'what were you doing then?' — you didn't prepare an answer.",
      },
      {
        title: "Not disclosing a prior visa refusal",
        body: "Refusal records are shared internationally. Undisclosed refusal = fraud bar. Disclosed refusal = officer asks why, you explain, often approved.",
      },
    ],
    whyItMatters:
      "Lying on the DS-160 is a federal crime explicitly stated in the form's certification. Detection means permanent visa ineligibility — no future travel, no green card, no citizenship. Truthfulness costs nothing; lies cost everything.",
    relatedSteps: [17, 21],
    officialSources: [
      {
        label: "INA 212(a)(6)(C) fraud bar (US Code)",
        url: "https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title8-section1182&num=0&edition=prelim",
      },
    ],
  },
  {
    number: 20,
    phase: 3,
    phaseName: "DS-160 and fees",
    phaseDescription: PHASE_DESC[3],
    title: "Upload photo to DS-160",
    shortDescription:
      "JPEG, under 240KB, square 1:1 (600x600 to 1200x1200), white bg, no glasses. Use the State Dept photo tool first.",
    estimatedMinutes: 20,
    documentsNeeded: 1,
    isFree: false,
    hasCriticalTip: true,
    instructions: {
      intro:
        "Photo upload is one of the top 3 reasons DS-160 submission fails. The State Department's photo tool catches spec failures before the upload — use it.",
      steps: [
        {
          title: "Confirm your JPEG matches all specs",
          body:
            "Format: JPEG. File size: under 240KB. Dimensions: square 1:1, between 600x600 and 1200x1200 pixels. Color: full color. Taken within the last 6 months.",
        },
        {
          title: "Run it through the State Dept photo tool",
          body:
            "Upload your photo to the official 'Photo Composition Test' tool. It flags head-size issues, background color, expression, lighting. If the tool passes it, the DS-160 will accept it.",
          link: {
            label: "Photo composition test tool",
            url: "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/photos/photo-composition-template.html",
          },
        },
        {
          title: "Upload through the DS-160 wizard",
          body:
            "DS-160 has a 'Photo' section. Click 'Browse', select the JPEG, click 'Upload'. If you see green checkmarks for all criteria, you're good. Red X = re-shoot.",
        },
        {
          title: "Fallback: bring printed photos to the interview",
          body:
            "If the upload fails after 3 tries, click 'I will bring my photo to the interview'. This costs no points but means you MUST bring the printed 2x2 photos to the consulate.",
        },
      ],
    },
    documents: [
      {
        key: "visa_photo_digital",
        name: "DS-160 photo (digital JPEG)",
        description:
          "Square 1:1 JPEG, under 240KB, 600x600 to 1200x1200 pixels, taken within last 6 months, no glasses, white background.",
        expiryRelevant: true,
      },
    ],
    commonMistakes: [
      {
        title: "JPEG too large (over 240KB)",
        body: "Most modern phone photos are 3-5MB. DS-160 rejects anything over 240KB. Use an online JPEG compressor or the State Dept photo tool to resize.",
      },
      {
        title: "Wrong aspect ratio",
        body: "DS-160 needs a perfect square. Phone photos are 4:3 or 3:2 — crop to 1:1 first or the upload fails.",
      },
      {
        title: "Glasses or off-white background",
        body: "Photos with glasses or non-pure-white backgrounds fail the automated DS-160 photo check. Caught at upload, not at the interview.",
      },
    ],
    whyItMatters:
      "A bad photo blocks the DS-160 submission. Until DS-160 is submitted, you can't pay the MRV fee or book the interview. A 20-minute photo task can delay the visa by a week if mishandled.",
    relatedSteps: [14, 21],
    officialSources: [
      {
        label: "Photo requirements",
        url: "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/photos.html",
      },
    ],
  },
  {
    number: 21,
    phase: 3,
    phaseName: "DS-160 and fees",
    phaseDescription: PHASE_DESC[3],
    title: "Review and submit DS-160",
    shortDescription:
      "Cross-check every field against passport, I-20, and transcripts before clicking submit. Submission is semi-final.",
    estimatedMinutes: 45,
    documentsNeeded: 0,
    isFree: false,
    hasCriticalTip: true,
    instructions: {
      intro:
        "DS-160 submission is semi-final — you can edit before paying the MRV fee, but each edit is friction. Catch every error now. Officers read the DS-160 before you sit down — what you submit is what they see.",
      steps: [
        {
          title: "Critical 5-field review with passport open",
          body:
            "Open your passport beside the laptop. Verify against the DS-160 Review page: (1) Surname (2) Given names (3) Date of birth (4) Passport number (5) Passport expiry. Character-by-character.",
        },
        {
          title: "Critical SEVIS-related review",
          body:
            "On the Student/Exchange Visitor section: SEVIS ID matches the I-20 ID exactly. School name matches I-20. Program start date matches I-20. Tuition + funding amounts match I-20.",
        },
        {
          title: "Read the full Review page top-to-bottom",
          body:
            "DS-160's Review page shows everything you entered. Skim every section header. Flag any 'inconsistent' or 'missing' warnings — they block submission.",
        },
        {
          title: "Click 'Submit Application'",
          body:
            "Once you click Submit, the DS-160 is locked. You can amend it by going back to CEAC, but each amendment generates a new confirmation page. Print only the LATEST one for the interview.",
        },
        {
          title: "Download and save the PDF confirmation",
          body:
            "After submitting, you get a Confirmation page with a barcode. Download the PDF, email it to yourself, save to cloud. This is the page you bring to the interview.",
        },
      ],
      outro:
        "If you find an error after submitting, log back into CEAC with your Application ID + DOB + security answer, go to the section, fix the error, resubmit. The new confirmation supersedes the old — bring the new one to the interview.",
    },
    documents: [],
    commonMistakes: [
      {
        title: "Typo in passport number on DS-160",
        body: "Passport-number mismatch between DS-160 and the actual passport you bring = 221(g) hold while consular system reconciles records. Average 1-3 weeks.",
      },
      {
        title: "Wrong SEVIS ID",
        body: "SEVIS ID wrong by even one character = consular system can't pull your I-20 record = interview cancelled, restart.",
      },
      {
        title: "Submitting an old DS-160 after amending",
        body: "If you submitted a DS-160, found an error, amended it, but printed the FIRST confirmation — you arrive at the interview with the wrong barcode. Officer's tablet can't match it to the current record.",
      },
    ],
    whyItMatters:
      "The officer reads your DS-160 in the seconds before you walk to the window. What's on it is the starting point of their assessment. Errors here make the officer skeptical before you've said a word.",
    relatedSteps: [16, 17, 18, 19, 20, 22],
    officialSources: [
      { label: "CEAC (DS-160 portal)", url: "https://ceac.state.gov" },
    ],
  },
  {
    number: 22,
    phase: 3,
    phaseName: "DS-160 and fees",
    phaseDescription: PHASE_DESC[3],
    title: "Print DS-160 confirmation page",
    shortDescription:
      "The barcode page is what the consulate scans. Print 2 copies, store PDF in cloud, ensure it's the latest version.",
    estimatedMinutes: 10,
    documentsNeeded: 1,
    isFree: false,
    hasCriticalTip: true,
    instructions: {
      intro:
        "The DS-160 confirmation page (with the 2D barcode) is the entry document to the consulate. Without the printed page that matches the LATEST submission, you can't enter the building.",
      steps: [
        {
          title: "Download the PDF from CEAC after submission",
          body:
            "Immediately after submitting, CEAC shows the Confirmation page. Click 'Print Confirmation' → save as PDF. The page must show your name, photo, and a 2D barcode bottom-left.",
        },
        {
          title: "Print two copies on plain white paper",
          body:
            "Black-and-white is fine — the barcode reads in B&W. Print on 8.5x11 (Letter) or A4 — don't shrink to half-page. Two copies: one for your interview folder, one backup.",
        },
        {
          title: "If you amended after first submission: print the new one",
          body:
            "Every time you edit and resubmit, CEAC generates a new confirmation with a new barcode. The old confirmation is invalid. Print the LATEST one and toss the old.",
        },
        {
          title: "Cloud backup the PDF",
          body:
            "Google Drive + email to yourself. The night before, you may want to pull the PDF on your phone to verify the latest version matches your printed copy.",
        },
      ],
    },
    documents: [
      {
        key: "ds160_confirmation",
        name: "DS-160 confirmation page (barcode)",
        description:
          "Printed page from CEAC showing your name, photo, and the 2D barcode. Must be the LATEST submission's confirmation if you amended. Two physical copies + cloud PDF.",
      },
    ],
    commonMistakes: [
      {
        title: "Bringing the wrong confirmation page (old version)",
        body: "Students who amended their DS-160 and printed the first version arrive at the consulate with a barcode that doesn't match the current record. Sent away to print the new one.",
      },
      {
        title: "Printing only a screenshot, not the PDF",
        body: "Screenshots lose resolution. The 2D barcode must scan cleanly. Print from the PDF, not from a phone screenshot.",
      },
    ],
    whyItMatters:
      "This is the entry document. No printed barcode = no entry into the consulate building. Students get turned away at the door — the visa appointment becomes a missed appointment.",
    relatedSteps: [21, 27, 39],
    officialSources: [
      { label: "CEAC", url: "https://ceac.state.gov" },
    ],
  },
  {
    number: 23,
    phase: 3,
    phaseName: "DS-160 and fees",
    phaseDescription: PHASE_DESC[3],
    title: "Create profile on US visa service site",
    shortDescription:
      "Most countries use a dedicated visa service site. Profile lets you pay MRV fee and book the interview slot.",
    estimatedMinutes: 20,
    documentsNeeded: 0,
    isFree: false,
    hasCriticalTip: false,
    instructions: {
      intro:
        "After the DS-160 is submitted, you need a separate account on the US visa service site for your country. This is where you pay the MRV fee and book your interview slot.",
      steps: [
        {
          title: "Find the right visa service site for your country",
          body:
            "Most countries use ustraveldocs.com; some regions use CGI Federal or another vendor. Check the US Embassy's website for your country to confirm the right one.",
          link: {
            label: "US visa appointment service (find your country)",
            url: "https://www.ustraveldocs.com/",
          },
        },
        {
          title: "Create a new account with passport details",
          body:
            "Email, password, passport number, full name (matching DS-160), date of birth, mobile number. The profile is shared across your future US visa applications.",
        },
        {
          title: "Enter your DS-160 confirmation barcode number",
          body:
            "The 10-character DS-160 confirmation number (from the printed page) is required to link your profile to your DS-160. The number is below the barcode.",
        },
        {
          title: "Select F-1 visa type and consulate location",
          body:
            "Pick 'Student (F1)' and the city where you'll interview. India: Mumbai, Delhi, Chennai, Kolkata, Hyderabad. Wrong consulate = wrong booking pool.",
        },
      ],
    },
    documents: [],
    commonMistakes: [
      {
        title: "Wrong visa service site (regional mismatch)",
        body: "Wrong portal = appointment can't be booked, MRV fee paid in the wrong system. Refund process takes 4-6 weeks.",
      },
      {
        title: "DS-160 barcode number entered incorrectly",
        body: "The profile won't link to your DS-160 — the system shows 'no DS-160 on file' when you try to book. Re-enter carefully.",
      },
    ],
    whyItMatters:
      "Without a visa service profile, no MRV fee, no appointment, no interview. This is mechanical work — get it right in 20 minutes and move on.",
    relatedSteps: [22, 24, 26],
    officialSources: [
      {
        label: "US visa appointment service (find your country)",
        url: "https://www.ustraveldocs.com/",
      },
    ],
  },
  {
    number: 24,
    phase: 3,
    phaseName: "DS-160 and fees",
    phaseDescription: PHASE_DESC[3],
    title: "Pay the MRV visa application fee",
    shortDescription:
      "$185 non-refundable. Pay through the visa service site using the country-specific method. Save the receipt to book the interview.",
    estimatedMinutes: 20,
    documentsNeeded: 0,
    isFree: false,
    hasCriticalTip: true,
    instructions: {
      intro:
        "The MRV (Machine Readable Visa) fee is $185 for F-1 since June 2023. Non-refundable even if your visa is denied. Pay via the country's official channel — paying wrong invalidates the fee.",
      steps: [
        {
          title: "Confirm the current MRV fee amount",
          body:
            "$185 USD for F-1 as of 2024. Fee changes occasionally — verify on travel.state.gov/visa-fees before paying.",
          link: {
            label: "Visa fees (Travel.State.Gov)",
            url: "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/fees/fees-visa-services.html",
          },
        },
        {
          title: "Choose the right payment method for your country",
          body:
            "Payment methods vary by country — bank transfer, cash at partner bank branches, or online card are the most common. The site shows which methods are valid for your country.",
        },
        {
          title: "Generate the fee reference number first",
          body:
            "On ustraveldocs.com (or equivalent), click 'Pay MRV fee'. The site generates a unique reference number specific to your country's portal. Use this exact number for the payment — paying without it = unattributable transfer.",
        },
        {
          title: "Save the receipt for 1 year",
          body:
            "After payment, the site shows a receipt with the date, amount, reference number. Save the PDF and print 2 copies. MRV receipts are valid for 1 year from payment date.",
        },
        {
          title: "Wait for system reconciliation (2 hours to 2 days)",
          body:
            "After paying, the visa service system takes from 2 hours (card payment) to 2 business days (bank transfer) to recognize the payment. You can't book the interview until the system updates.",
        },
      ],
    },
    documents: [],
    commonMistakes: [
      {
        title: "Paying without generating the reference number first",
        body: "Bank/cash payment without the reference number is unattributable — your money is in limbo. Reclaim takes 2-4 weeks of paperwork.",
      },
      {
        title: "Using the wrong payment method for your country",
        body: "Online card in a cash-only country = transaction rejected, payment held by bank. Stop, switch methods.",
      },
      {
        title: "Losing the receipt before booking the interview",
        body: "Without the MRV receipt, you can't book the appointment. Reconstruction from the bank takes days.",
      },
    ],
    whyItMatters:
      "MRV is the gate between DS-160 and interview booking. Pay wrong and you wait. Pay right and you book within the hour.",
    relatedSteps: [23, 26],
    officialSources: [
      {
        label: "Visa fees (Travel.State.Gov)",
        url: "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/fees/fees-visa-services.html",
      },
    ],
  },
  {
    number: 25,
    phase: 3,
    phaseName: "DS-160 and fees",
    phaseDescription: PHASE_DESC[3],
    title: "Schedule biometrics appointment (if required)",
    shortDescription:
      "10 fingerprints + digital photo at the Visa Application Center (VAC). Required for most first-timers. ~15 minutes on-site.",
    estimatedMinutes: 15,
    documentsNeeded: 0,
    isFree: false,
    hasCriticalTip: false,
    instructions: {
      intro:
        "Biometrics (fingerprints + photo) are collected separately from the interview, usually at a Visa Application Center (VAC) a few days before. Required for most first-time applicants under 80.",
      steps: [
        {
          title: "Check if biometrics are required at your consulate",
          body:
            "Most countries require biometrics for first-time F-1 applicants. The visa service site shows whether you need a separate VAC appointment when you start booking — don't skip if shown.",
        },
        {
          title: "Book the VAC slot via the same site as the interview",
          body:
            "On ustraveldocs.com (or equivalent), after MRV is paid, the system offers two booking flows: VAC (biometrics) and Consulate (interview). Book VAC first, on a date 1-3 days before the interview.",
        },
        {
          title: "Bring only the essentials to VAC",
          body:
            "Passport, VAC appointment letter, DS-160 confirmation page. No documents, no folders, no electronics — VACs have lockers but minimize what you bring.",
        },
        {
          title: "Expect 15-30 minutes on-site",
          body:
            "Security screening → check-in → fingerprints (10 fingers) → photo → done. The biometric data is linked to your application automatically — you submit nothing.",
        },
      ],
    },
    documents: [],
    commonMistakes: [
      {
        title: "Booking the consulate appointment first by mistake",
        body: "Some students book the interview without booking VAC first. The interview is then invalidated because biometrics aren't on file. Cancel + rebook in the right order.",
      },
      {
        title: "Showing up at VAC without the appointment letter",
        body: "VAC staff turn away walk-ins. Print the appointment letter or show on your phone.",
      },
    ],
    whyItMatters:
      "Biometrics must be on file before the interview. Without them, the consulate's system blocks the visa case from advancing. Standard waiver age is 80+ — for everyone else, this is required.",
    relatedSteps: [24, 26, 40],
    officialSources: [
      {
        label: "US visa appointment service (find your country)",
        url: "https://www.ustraveldocs.com/",
      },
    ],
  },
  {
    number: 26,
    phase: 3,
    phaseName: "DS-160 and fees",
    phaseDescription: PHASE_DESC[3],
    title: "Schedule visa interview appointment",
    shortDescription:
      "Pick the nearest consulate. Slots open daily at midnight. Book the earliest available — don't wait for 'perfect' prep.",
    estimatedMinutes: 20,
    documentsNeeded: 0,
    isFree: false,
    hasCriticalTip: true,
    instructions: {
      intro:
        "The interview slot determines your entire timeline. In peak season (April-July), slots fill 3-6 months in advance. Book the earliest you can find — you can prep more between booking and the interview.",
      steps: [
        {
          title: "Log into the visa service site (ustraveldocs.com or equivalent)",
          body:
            "After MRV payment reconciles (2 hours to 2 days post-payment), the 'Schedule Appointment' option becomes active. Click it.",
        },
        {
          title: "Pick your consulate carefully",
          body:
            "India: 5 consulates (Delhi, Mumbai, Chennai, Hyderabad, Kolkata). Pick the one nearest where you live OR where slots are most available. Each consulate has different historical approval patterns — sometimes a different city has earlier slots AND a higher approval rate for your profile.",
        },
        {
          title: "Check slots at midnight, 2 AM, and 5 AM",
          body:
            "Slots release in batches at midnight local consulate time, and again throughout the night. Refresh the booking page at off-hours. Slots that disappear in seconds at noon are sometimes sitting available at 2 AM.",
        },
        {
          title: "Allow at least 2-3 weeks between booking and interview",
          body:
            "Between booking and the interview, you'll prep documents, do mock interviews, refine answers. Booking the interview for next week is panic-territory — not recommended unless your intake date is imminent.",
        },
        {
          title: "Print the appointment confirmation",
          body:
            "After booking, print the appointment letter showing the consulate, date, time, and your appointment number. Include this in your interview folder.",
        },
      ],
      outro:
        "Don't fall into 'I'll book when I'm fully ready'. Book the earliest slot now. The slot is the deadline that forces the prep. If your intake date is in 60 days and you're still 'prepping', you've already lost.",
    },
    documents: [],
    commonMistakes: [
      {
        title: "Waiting for 'perfect' prep to book",
        body: "In peak season, every week of delay = 2-3 weeks of slot scarcity. Students who wait end up scrambling for any slot that lands before their I-20 start date.",
      },
      {
        title: "Choosing a far consulate without checking",
        body: "Picking the wrong consulate means a more expensive trip and sometimes a worse approval pattern. Check r/F1Visa or AmCit forums for current consulate approval trends before booking.",
      },
      {
        title: "Booking before MRV reconciles",
        body: "Booking the slot before the MRV payment is recognized = the system shows 'no fee on file' and cancels the appointment automatically.",
      },
    ],
    whyItMatters:
      "The interview date is THE deadline. Everything before it is prep, everything after it is consequence. A slot booked late = a slot too close to your I-20 start = pressure that hurts performance.",
    relatedSteps: [24, 25, 27, 36],
    officialSources: [
      {
        label: "US visa appointment service (find your country)",
        url: "https://www.ustraveldocs.com/",
      },
    ],
  },

  // ============================================================
  // PHASE 4 — Interview preparation (steps 27-40)
  // ============================================================
  {
    number: 27,
    phase: 4,
    phaseName: "Interview preparation",
    phaseDescription: PHASE_DESC[4],
    title: "Organize all documents in interview folder order",
    shortDescription:
      "Tabbed folder: DS-160 → SEVIS receipt → MRV → passport → I-20 → financials → academics → ties → photos.",
    estimatedMinutes: 60,
    documentsNeeded: 9,
    isFree: false,
    hasCriticalTip: true,
    instructions: {
      intro:
        "Officers see 200+ applications a day. A clean, tabbed, in-order folder signals preparedness in the first 5 seconds. A jumbled stack signals 'this person hasn't thought it through' before you've spoken.",
      steps: [
        {
          title: "Use a slim tabbed folder, not a binder",
          body:
            "Letter-size, 5-10 tabs, slim enough to fit in the consulate's plastic tray. Avoid bulky 3-ring binders — they look amateurish and don't lay flat on the counter.",
        },
        {
          title: "Follow the exact handoff order",
          body:
            "Top to bottom: (1) DS-160 confirmation (2) SEVIS I-901 receipt (3) MRV fee receipt (4) Passport (5) I-20 (6) Financial documents (7) Academic documents (8) Ties evidence (9) Spare photos. This matches the order officers ask for documents.",
        },
        {
          title: "Originals on top, copies behind each tab",
          body:
            "For every document, put the original on top, then 1-2 photocopies behind. Officer asks for original → you hand it over → if they want a copy, it's right there.",
        },
        {
          title: "Label tabs clearly",
          body:
            "Hand-written or printed: 'DS-160', 'SEVIS', 'MRV', 'I-20', 'Financials', 'Academics', 'Ties', 'Photos'. Quick visual reference under stress.",
        },
        {
          title: "Pack the night before — never the morning of",
          body:
            "Morning-of packing under pressure is when documents get forgotten. Pack the night before, then put the folder by the door. Don't open it again until you're at the consulate.",
        },
      ],
    },
    documents: [
      { key: "ds160_confirmation", name: "DS-160 confirmation", description: "Printed barcode page, latest submission." },
      { key: "sevis_receipt", name: "SEVIS I-901 receipt", description: "Printed payment confirmation." },
      { key: "mrv_receipt", name: "MRV fee receipt", description: "Printed visa fee payment receipt." },
      { key: "passport_current", name: "Current passport", description: "Original + photocopy of bio page." },
      { key: "i20_form", name: "Form I-20", description: "Original signed I-20." },
      { key: "bank_statements", name: "Bank statements (3-6 months)", description: "Original or bank-stamped." },
      { key: "sponsor_letter", name: "Sponsor letter + ITRs", description: "Sponsor support letter + income proof." },
      { key: "transcripts", name: "Academic transcripts + degree cert", description: "Original transcripts + degree." },
      { key: "ties_evidence", name: "Ties to home country evidence", description: "Property, family business, or job offer documents." },
    ],
    commonMistakes: [
      {
        title: "Jumbled stack of documents",
        body: "Officer asks for SEVIS receipt and you flip through 8 documents to find it — visible disorganization tells the officer 'this person isn't prepared.'",
      },
      {
        title: "Bulky 3-ring binder",
        body: "Officers prefer slim folders that fit their tray. Binders are awkward, take time to open, and signal over-preparation.",
      },
      {
        title: "Originals mixed with copies, no system",
        body: "Officer asks for original I-20, you hand over the copy by mistake. Embarrassing and resets the rhythm of the interview.",
      },
    ],
    whyItMatters:
      "The folder is your first impression. Officers form an opinion in 5-10 seconds. Tabbed + in-order + originals-up = 'this person did the work'. Jumbled = 'this person is winging it'.",
    relatedSteps: [22, 28, 39],
    officialSources: [
      {
        label: "Required documents (Travel.State.Gov)",
        url: "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html",
      },
    ],
  },
  {
    number: 28,
    phase: 4,
    phaseName: "Interview preparation",
    phaseDescription: PHASE_DESC[4],
    title: "Prepare academic statement",
    shortDescription:
      "One-sentence answer to 'Why this university?' that names a specific lab, professor, or course — not the ranking.",
    estimatedMinutes: 120,
    documentsNeeded: 0,
    isFree: false,
    hasCriticalTip: true,
    instructions: {
      intro:
        "Officers ask 'Why this school?' on roughly half of all F-1 interviews. A vague answer triggers 3-5 follow-up questions. A specific one closes the topic in 10 seconds.",
      steps: [
        {
          title: "Name a specific professor, lab, or research initiative",
          body:
            "'Professor Mehta's solid-state battery lab at Purdue' beats 'good engineering program at Purdue' every time. Officers read these answers daily — they recognize specificity vs generic immediately.",
        },
        {
          title: "Know your program's curriculum",
          body:
            "Be able to name 3-5 courses you'll take in semester 1, the credit structure (16 credits/semester typical), and the capstone or thesis component. Officers occasionally probe with 'what courses?' to verify legitimacy.",
        },
        {
          title: "Connect the program to your post-graduation career",
          body:
            "'This MS in materials science will let me lead R&D at my family's manufacturing business back home' is a complete arc. Officers look for: degree → specific career step → home country. Missing any link = follow-up.",
        },
        {
          title: "Prepare for 'why not a higher-ranked school?'",
          body:
            "If you're at #25 but were admitted to #5, have a real reason: 'Better fit for my specific research area' OR 'Funded assistantship vs full-pay'. Avoid 'didn't get in' if you did get in elsewhere — officers cross-check.",
        },
        {
          title: "Prepare for 'why not study in your home country?'",
          body:
            "Name a SPECIFIC capability the US program has that your home country doesn't: equipment, research output, specific faculty, internship pipeline. 'It's better in the US' is not an answer.",
        },
      ],
      outro:
        "Practice this answer 20 times out loud before the interview. It should come out in 15-20 seconds, calm and clear. If you stumble, the officer prompts — that prompt eats into the interview's other answers.",
    },
    documents: [],
    commonMistakes: [
      {
        title: "Generic 'good reputation' answer",
        body: "'It has a good reputation in CS' is the most common bad answer. Triggers: 'Why this specific school's CS over MIT's?' If you can't answer that, you've lost the credibility battle.",
      },
      {
        title: "Praising the country, not the school",
        body: "'I love the US' isn't an answer to 'Why this school?' It signals immigrant intent. Stay on the school's specific strength.",
      },
      {
        title: "Naming a professor who's left the school",
        body: "If you name 'Prof X' and the officer's tablet shows Prof X moved to another university 6 months ago, you look like you researched 2019 forums instead of the actual school's current faculty.",
      },
    ],
    whyItMatters:
      "The academic answer is the most-asked F-1 question. A weak answer here is the #1 trigger for follow-up questions that can spiral into denial under 214(b). Strong specificity here closes the topic and frees the interview to move on.",
    relatedSteps: [29, 32, 41],
    officialSources: [
      {
        label: "F-1 visa overview",
        url: "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html",
      },
    ],
  },
  {
    number: 29,
    phase: 4,
    phaseName: "Interview preparation",
    phaseDescription: PHASE_DESC[4],
    title: "Document university selection rationale",
    shortDescription:
      "Be able to explain the trade-off you made: this school vs higher-ranked admits, this department's strengths, this city's fit.",
    estimatedMinutes: 90,
    documentsNeeded: 0,
    isFree: false,
    hasCriticalTip: false,
    instructions: {
      intro:
        "Officers ask 'Why this school?' but they're really asking 'Did you make this decision thoughtfully?' Having a clear rationale signals seriousness — winging it signals you'll wing your studies too.",
      steps: [
        {
          title: "List your school selection criteria (in order)",
          body:
            "Top-3 reasons you chose this school: (1) Specific research/faculty, (2) Funding/affordability, (3) Career outcomes for your home country. Write these down — you'll refer to them in 2-3 different officer questions.",
        },
        {
          title: "Know 2-3 facts about your department",
          body:
            "Department size, recent significant grant or research output, ranking in your specific field (not the overall school ranking), notable alumni who returned to your country.",
        },
        {
          title: "Have a one-line answer for 'why not a higher-ranked school?'",
          body:
            "If you turned down a higher-ranked admit, be able to articulate: 'The fellowship at #25 is fully funded for 2 years, the #5 offer was tuition-only.' Real trade-offs are credible.",
        },
        {
          title: "Understand the school's admit rate roughly",
          body:
            "Top-5 schools admit 4-8%. Top-25 schools admit 15-25%. Mid-tier schools admit 40-60%. Knowing the rough number signals you understand the credibility of your admit.",
        },
        {
          title: "Don't claim 'random choice' on top-ranked schools",
          body:
            "Claiming you 'randomly applied' to a top-10 school where you were admitted = officer suspects you're hiding the real reason or didn't think it through. Have the real reason.",
        },
      ],
    },
    documents: [],
    commonMistakes: [
      {
        title: "Memorized lines that sound canned",
        body: "Officers detect rote memorization in 10 seconds. Your answer should feel like a conversation — same content, but in your voice with natural pauses.",
      },
      {
        title: "Inconsistent rationale across questions",
        body: "Say 'I chose this school for the fellowship' to one question, then 'I chose it for the location' to another. Officers cross-reference your answers in real time — inconsistency = doubt.",
      },
    ],
    whyItMatters:
      "Your selection rationale is the spine of the interview. It comes up in 3-5 different officer questions. A consistent, real rationale ties all your answers together. An inconsistent one undoes the strong answers.",
    relatedSteps: [28, 32],
    officialSources: [
      {
        label: "F-1 interview tips (Travel.State.Gov)",
        url: "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html",
      },
    ],
  },
  {
    number: 30,
    phase: 4,
    phaseName: "Interview preparation",
    phaseDescription: PHASE_DESC[4],
    title: "Prepare financial sponsor documentation",
    shortDescription:
      "Know the exact COA number from your I-20. Know your sponsor's liquid funds. Prepare the one-paragraph who-pays story.",
    estimatedMinutes: 60,
    documentsNeeded: 2,
    isFree: false,
    hasCriticalTip: true,
    instructions: {
      intro:
        "The financial answer is the second-most-common reason for F-1 denial after weak ties. Officers want a clear, specific, one-paragraph answer: who, how much, from where.",
      steps: [
        {
          title: "Know the exact cost of attendance from your I-20",
          body:
            "Open your I-20. The 'estimated average costs' section shows tuition + living for year 1. Memorize the number to the dollar. Officers test if you know it.",
        },
        {
          title: "Know your sponsor's liquid funds to the nearest $10k",
          body:
            "If your father is your sponsor: how much does he have in liquid (bank + FD + mutual funds)? You'll answer something like 'My father has approximately $120,000 in liquid savings'. Vagueness triggers follow-up.",
        },
        {
          title: "Prepare the one-paragraph who-pays story",
          body:
            "'My father is a [profession] earning approximately [annual income]. He has [liquid amount] in savings and has committed to funding my [program cost] education. The I-20 shows [COA], well within his support capacity.' Practice this 20 times.",
        },
        {
          title: "Know your sponsor's profession and income source",
          body:
            "If asked 'what does your father do?' — 'He runs an export business earning approximately $50,000 annually.' Specific income, specific business. Vague = follow-up.",
        },
        {
          title: "Prepare for the loan question",
          body:
            "If part of your funding is an education loan, be ready: lender name, amount, interest rate, your post-grad repayment plan. Loans aren't a problem; an unprepared loan answer is.",
        },
      ],
    },
    documents: [
      {
        key: "financial_summary",
        name: "Financial summary note",
        description:
          "One-page personal note: COA from I-20, sponsor's income, sponsor's liquid funds, any loan details, fellowship if any. For your own reference during prep, not for the officer.",
      },
      {
        key: "bank_statements_recent",
        name: "Latest bank statement",
        description:
          "Most recent month's statement — to verify current balance. Officer occasionally asks 'how much is in the bank right now?'",
        expiryRelevant: true,
      },
    ],
    commonMistakes: [
      {
        title: "Vague answers to 'how much does your sponsor have?'",
        body: "'They have enough' is not an answer. 'They have approximately $120,000 liquid' is. Officers want a number, even if approximate.",
      },
      {
        title: "Saying 'my parents will manage somehow'",
        body: "This is the single most common bad answer. It signals the funding isn't actually arranged. Officer denies under 214(b) financial-insufficiency.",
      },
      {
        title: "Mismatched numbers between DS-160, I-20, and your answer",
        body: "DS-160 says $50k from sponsor. I-20 says $60k from family. You say $40k in interview. Three different numbers = officer can't trust any. Denial.",
      },
    ],
    whyItMatters:
      "Officers reject under 214(b) when they can't trace the money flow. Vague financial answers are the second most common denial reason. A specific, confident, consistent financial story removes one of the biggest 214(b) risks.",
    relatedSteps: [4, 11, 32],
    officialSources: [
      {
        label: "F-1 visa financial requirements",
        url: "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html",
      },
    ],
  },
  {
    number: 31,
    phase: 4,
    phaseName: "Interview preparation",
    phaseDescription: PHASE_DESC[4],
    title: "Document return-to-home-country ties",
    shortDescription:
      "Stack ranked: signed job offer > property > family business > dependent parents > verbal intent. Bring documents for each.",
    estimatedMinutes: 90,
    documentsNeeded: 2,
    isFree: false,
    hasCriticalTip: true,
    instructions: {
      intro:
        "Ties-to-home is the most-tested element of every F-1 interview. Officers presume non-immigrant intent under INA 214(b) — you have to prove you'll come home. Documents > words.",
      steps: [
        {
          title: "Identify your strongest 2-3 ties",
          body:
            "Strongest tier: signed post-grad job offer in home country. Strong: property in your name. Mid: family business expecting you, dependent parents, sibling care obligations. Pick what's REAL for you.",
        },
        {
          title: "Bring physical evidence for each strong tie",
          body:
            "Job offer = signed letter on company letterhead with start date after your program. Property = sale deed or property tax receipt. Family business = registration document + your role. Dependent parents = medical records or written declaration.",
        },
        {
          title: "Practice the return story in one paragraph",
          body:
            "'After my MS, I'll return home to lead R&D at my family's manufacturing firm. My parents depend on me as the eldest child. We own property back home. My current employer has offered me a senior role after graduation.' Three ties, one paragraph.",
        },
        {
          title: "Avoid weakest answers",
          body:
            "'I love my country' = irrelevant. 'I plan to return' = empty assertion. 'My family is there' = bare minimum, not enough on its own. Always pair an emotional reason with documentary evidence.",
        },
        {
          title: "Know the order in which to present ties",
          body:
            "If asked 'why will you come back?', lead with the strongest documented tie. Build the others on top. The order matters because officers stop listening once they're convinced — give them the gold first.",
        },
      ],
    },
    documents: [
      {
        key: "ties_primary",
        name: "Primary ties evidence",
        description:
          "Your strongest tie's document: signed job offer letter OR property sale deed OR family business registration. Original.",
      },
      {
        key: "ties_secondary",
        name: "Secondary ties evidence",
        description:
          "Backup ties: family medical records, dependent declaration, property tax receipt, business net-worth statement. Pick the next strongest.",
      },
    ],
    commonMistakes: [
      {
        title: "Verbal intent without documents",
        body: "Talking about ties without paperwork = officer hears 'no ties'. Even strong intent needs paper backing.",
      },
      {
        title: "Padding weak ties to sound impressive",
        body: "Listing 8 weak ties is worse than 2 strong ones. Officers prefer specific, strong evidence over a long list of vague ones.",
      },
      {
        title: "Fabricated ties",
        body: "Fake property docs, fake job offers = fraud under 212(a)(6)(C) = permanent visa ineligibility. Never.",
      },
    ],
    whyItMatters:
      "214(b) is the most-cited denial reason for F-1. Ties evidence is the only counter. Without verifiable home-country anchors, the officer assumes intent to stay and denies. The visa is approved on documentary evidence of return — not promises.",
    relatedSteps: [13, 32, 41],
    officialSources: [
      {
        label: "INA 214(b) overview",
        url: "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/visa-denials.html",
      },
    ],
  },
  {
    number: 32,
    phase: 4,
    phaseName: "Interview preparation",
    phaseDescription: PHASE_DESC[4],
    title: "Practice answering common interview questions",
    shortDescription:
      "20 most-common F-1 questions. Practice OUT LOUD. The mouth needs the reps, not just the brain.",
    estimatedMinutes: 180,
    documentsNeeded: 0,
    isFree: false,
    hasCriticalTip: true,
    instructions: {
      intro:
        "The visa interview is a 3-7 minute oral exam. You can know the answers cold in your head and still freeze at the window. Voice practice is non-negotiable.",
      steps: [
        {
          title: "Memorize the 10 most-asked F-1 questions",
          body:
            "(1) Why this university? (2) Why the US? (3) Why not study in your home country? (4) Who is paying? (5) What will you do after graduation? (6) Do you have relatives in the US? (7) What does your father/mother do? (8) Have you been to the US before? (9) What is your CGPA? (10) Have you been refused a US visa before?",
        },
        {
          title: "Prepare 1-paragraph answers for each",
          body:
            "Write out each answer. Each should be 30-60 seconds spoken. Then DON'T memorize the script — internalize the 3-5 key points and let the words come naturally each time.",
        },
        {
          title: "Practice every answer 10 times OUT LOUD",
          body:
            "In your head ≠ out loud. Voice cracks, breathing patterns, filler words — these only show up when speaking. Record yourself on phone, listen back, iterate.",
        },
        {
          title: "Practice the curveball questions",
          body:
            "'Why this specific lab?' 'What if your visa is denied?' 'What if you don't get a job after graduation?' These are tier-2 questions officers use to test depth. Have an answer.",
        },
        {
          title: "Time yourself: 30-60 seconds per answer",
          body:
            "Officers interrupt long answers. Practice keeping each answer to 30-60 seconds. Anything longer signals 'this person is over-explaining' which signals 'this person is hiding something'.",
        },
      ],
      outro:
        "Use GetStamped's voice mock interview at least twice during this step. The voice AI catches issues your notes can't — filler words, pace, confidence. Two mock interviews is the minimum.",
    },
    documents: [],
    commonMistakes: [
      {
        title: "Mental rehearsal only, no speaking",
        body: "You'll know the answer in your head, then freeze at the consulate when you have to say it. Voice cracks under pressure — practice cracking it now.",
      },
      {
        title: "Over-rehearsed canned answers",
        body: "Memorized scripts sound robotic. Officers detect this in seconds. Internalize the points, let the words come naturally.",
      },
      {
        title: "No practice of the curveball questions",
        body: "If you only practice the top-10 obvious questions, the officer's eleventh question — the one that doesn't have a memorized answer — derails the entire interview.",
      },
    ],
    whyItMatters:
      "The interview is a verbal performance under pressure. Mental prep doesn't transfer to verbal fluency. The students who get approved are the ones who've done 50+ reps of every answer out loud.",
    relatedSteps: [28, 29, 30, 31, 33, 35],
    officialSources: [
      {
        label: "Interview tips (Study in the States)",
        url: "https://studyinthestates.dhs.gov/students/prepare/visa-interview",
      },
    ],
  },
  {
    number: 33,
    phase: 4,
    phaseName: "Interview preparation",
    phaseDescription: PHASE_DESC[4],
    title: "Complete first mock interview",
    shortDescription:
      "Use GetStamped voice mock — choose your scenario. Don't stop mid-session even if you stumble. Assess afterward.",
    estimatedMinutes: 45,
    documentsNeeded: 0,
    isFree: false,
    hasCriticalTip: false,
    instructions: {
      intro:
        "The first mock interview's purpose is to find out what you don't know. Don't optimize for performance — optimize for honest feedback.",
      steps: [
        {
          title: "Pick a scenario that matches your real consulate",
          body:
            "GetStamped offers scenarios for Mumbai, Delhi, Chennai, Hyderabad, Kolkata. Each consulate has its own questioning style. Pick yours.",
        },
        {
          title: "Choose the standard officer first",
          body:
            "Start with 'standard officer' on your first mock — this is the median consulate experience. Save 'strict officer' for mock #2 once you have feedback.",
        },
        {
          title: "Don't stop if you stumble",
          body:
            "If you freeze on a question, take a breath, give your best answer, move on. The real interview has no pause button — practice handling stumbles within the flow.",
        },
        {
          title: "Record the session if possible",
          body:
            "GetStamped saves the transcript automatically. Save audio if you want to hear your own delivery — tone, pace, filler words are easier to catch on playback.",
        },
        {
          title: "Honestly assess: where did you struggle?",
          body:
            "After the session, write down: which questions felt easy, which felt rehearsed, which made you panic. The panic ones are step 34's homework.",
        },
      ],
    },
    documents: [],
    commonMistakes: [
      {
        title: "Optimizing for a 'good score' instead of honest feedback",
        body: "If you only answer the easy questions and skip hard ones, you didn't learn anything. The first mock is for finding weakness, not hiding it.",
      },
      {
        title: "Doing one mock and assuming you're ready",
        body: "One mock isn't enough. The score on mock #1 reflects your baseline; the score on mock #3 reflects your readiness. Minimum two mocks before the real interview.",
      },
    ],
    whyItMatters:
      "Mock interviews surface the gaps between 'I think I know the answer' and 'I can deliver the answer under pressure'. Most students discover at the real interview that those are very different things. Mocks close the gap.",
    relatedSteps: [32, 34, 35],
    officialSources: [
      {
        label: "Interview tips (Study in the States)",
        url: "https://studyinthestates.dhs.gov/students/prepare/visa-interview",
      },
    ],
  },
  {
    number: 34,
    phase: 4,
    phaseName: "Interview preparation",
    phaseDescription: PHASE_DESC[4],
    title: "Review feedback and refine answers",
    shortDescription:
      "Focus on the 2-3 answers that scored lowest. Rewrite them. Practice them 10 times before mock #2.",
    estimatedMinutes: 60,
    documentsNeeded: 0,
    isFree: false,
    hasCriticalTip: false,
    instructions: {
      intro:
        "GetStamped scores each answer on clarity, confidence, consistency, financial story. The score is the diagnosis — the rewrite is the cure.",
      steps: [
        {
          title: "Sort answers by score, focus on lowest 2-3",
          body:
            "Open the feedback page. Sort questions by score. Anything below 80/100 is a known weakness. The top-scored answers are fine — leave them alone. Focus prep time on the weak ones.",
        },
        {
          title: "Read the AI's specific feedback per answer",
          body:
            "For each weak answer, the feedback page shows what triggered the lower score: 'too vague on financials', 'hesitation on return plans', 'inconsistent with DS-160'. Read it word-by-word.",
        },
        {
          title: "Rewrite each weak answer with the feedback in mind",
          body:
            "If the feedback says 'add specific dollar amount for sponsor income', then rewrite to include that. Don't generalize — make the specific fix the feedback called for.",
        },
        {
          title: "Practice the rewritten answers 10 times each",
          body:
            "Out loud, on your phone's voice recorder. After 10 reps, the rewrite feels natural — not scripted. That's when it's ready.",
        },
        {
          title: "Save the rewritten versions",
          body:
            "Write the new answers into GetStamped's prep notes or a personal doc. Reference these in your final review the night before the interview.",
        },
      ],
    },
    documents: [],
    commonMistakes: [
      {
        title: "Ignoring the feedback because the score 'felt unfair'",
        body: "The AI evaluates against the same criteria officers use, but it's a practice-session check, not a prediction of your real outcome. If it flagged your answer as weak, treat that as a cue to tighten it, not a verdict on your case.",
      },
      {
        title: "Rewriting answers without practicing them out loud",
        body: "A rewritten answer that's only ever been read silently isn't a rewritten answer — it's a draft. 10 reps out loud minimum.",
      },
    ],
    whyItMatters:
      "Mocks without iteration are useless. The whole point is to find weaknesses and fix them. Reviewing feedback honestly is what turns a baseline mock into interview-ready prep.",
    relatedSteps: [33, 35],
    officialSources: [
      {
        label: "Interview tips (Study in the States)",
        url: "https://studyinthestates.dhs.gov/students/prepare/visa-interview",
      },
    ],
  },
  {
    number: 35,
    phase: 4,
    phaseName: "Interview preparation",
    phaseDescription: PHASE_DESC[4],
    title: "Complete second mock interview",
    shortDescription:
      "Switch to 'strict officer'. Focus on naturalness, not perfection. Should feel like a conversation, not a recital.",
    estimatedMinutes: 45,
    documentsNeeded: 0,
    isFree: false,
    hasCriticalTip: false,
    instructions: {
      intro:
        "Mock #2 is the readiness check. You've fixed your weak answers — now you test under harder conditions to see if the fixes hold.",
      steps: [
        {
          title: "Choose 'strict officer' scenario",
          body:
            "Strict officers ask follow-ups, interrupt, throw curveballs. If your prep survives strict officer at 80+, your answers are holding up under pressure — good sign, not a guarantee.",
        },
        {
          title: "Focus on the previously-weak answers",
          body:
            "Mock #1 found your weak spots. Mock #2 retests them. If they still score below 85, do a third mock. Don't go to the real interview with a known-weak answer.",
        },
        {
          title: "Listen for naturalness in your delivery",
          body:
            "After the session, listen to the audio. Do your answers sound rehearsed or natural? Officers prefer natural. Rehearsed = robotic = 'is this person memorized?' suspicion.",
        },
        {
          title: "Aim for 85+ on every weak answer",
          body:
            "If any answer scored below 85 in mock #1 and is still below 85 in mock #2, that's the answer that's going to derail your interview. Either keep practicing OR adjust the answer structure entirely.",
        },
        {
          title: "Trust the prep — don't over-do",
          body:
            "If mock #2 went well across the board, you're ready. Doing 5 more mocks creates over-rehearsal. Stop while you're sharp.",
        },
      ],
    },
    documents: [],
    commonMistakes: [
      {
        title: "Over-rehearsing past mock #3",
        body: "After 3-4 mocks, additional practice causes regression — answers start sounding scripted. Stop when you're sharp, not when you're perfect.",
      },
      {
        title: "Doing mocks back-to-back without feedback review",
        body: "Mock-feedback-mock-feedback is the pattern. Skipping feedback review between mocks means you're just repeating the same mistakes louder.",
      },
    ],
    whyItMatters:
      "The second mock is your readiness gate. Pass it = go interview. Fail it = one more cycle of feedback + practice + retest. The students who skip mock #2 are the ones surprised at the real interview.",
    relatedSteps: [33, 34, 41],
    officialSources: [
      {
        label: "Interview tips (Study in the States)",
        url: "https://studyinthestates.dhs.gov/students/prepare/visa-interview",
      },
    ],
  },
  {
    number: 36,
    phase: 4,
    phaseName: "Interview preparation",
    phaseDescription: PHASE_DESC[4],
    title: "Plan interview day logistics",
    shortDescription:
      "Consulate address, floor, entrance, transit, parking. 90 minutes of buffer. No phones inside — plan for the lockbox.",
    estimatedMinutes: 30,
    documentsNeeded: 0,
    isFree: false,
    hasCriticalTip: true,
    instructions: {
      intro:
        "Late = automatic reschedule, not a 5-minute grace. The interview is also a logistics test: students who can't navigate consulate-day logistics signal they can't navigate US life either.",
      steps: [
        {
          title: "Confirm the consulate address and entrance",
          body:
            "Google Maps the consulate. Check Street View for the actual entrance — many consulates have separate visitor entrances on different streets. Mumbai consulate has 3 entrances depending on visa type — F-1 uses a specific one.",
        },
        {
          title: "Plan transit with 90 minutes of buffer",
          body:
            "If the interview is at 10 AM and the consulate is 45 minutes away, leave at 7:30. Don't optimize this. Traffic, road closures, security queues — they happen. Arriving 90 minutes early and waiting is fine. Arriving 5 minutes late is a reschedule.",
        },
        {
          title: "Park, don't drive — or have a drop-off plan",
          body:
            "Most consulates have NO public parking. If you drive, the car must wait outside (parents/drivers can wait blocks away). Better: Uber/cab drop-off at the entrance.",
        },
        {
          title: "Plan for the no-phone rule",
          body:
            "Most consulates ban phones, smartwatches, electronics. Some have lockers (free or paid), most don't. Plan: leave phone with parent/driver waiting outside, OR use a paid locker at a nearby pharmacy.",
        },
        {
          title: "Bring no bags or non-essentials",
          body:
            "Document folder + passport + wallet. No backpacks, no laptops, no extras. Bag rules are strict; extras get held at security, slowing your check-in.",
        },
      ],
    },
    documents: [],
    commonMistakes: [
      {
        title: "Underestimating transit time",
        body: "Leaving 30 minutes early in a 45-minute commute = arriving stressed and possibly late. 90 minutes buffer is the right answer.",
      },
      {
        title: "Bringing a phone in expecting to use the lockbox",
        body: "Some consulates have no lockbox. If you arrive with a phone and there's no locker, you're sent to find one — losing your slot.",
      },
      {
        title: "Wrong entrance",
        body: "Showing up at the visa-applicant entrance when you should be at the US-citizen-services entrance (or vice versa) wastes 30 minutes and stresses you out.",
      },
    ],
    whyItMatters:
      "A late arrival = automatic reschedule + lost slot + delayed timeline by weeks. The logistics of getting there safely on time are non-negotiable.",
    relatedSteps: [26, 37, 41],
    officialSources: [
      {
        label: "US Embassy/Consulate locator",
        url: "https://www.usembassy.gov/",
      },
    ],
  },
  {
    number: 37,
    phase: 4,
    phaseName: "Interview preparation",
    phaseDescription: PHASE_DESC[4],
    title: "Confirm consulate location and timing",
    shortDescription:
      "Re-check the booking, look up consulate-specific rules, check for US holiday closures, save consulate phone number.",
    estimatedMinutes: 20,
    documentsNeeded: 0,
    isFree: false,
    hasCriticalTip: false,
    instructions: {
      intro:
        "48 hours before the interview, do a final logistics confirmation. Consulates occasionally reschedule due to staffing or US holidays — better to know now than at the door.",
      steps: [
        {
          title: "Log into ustraveldocs.com and re-verify the appointment",
          body:
            "Pull up the booking. Confirm date, time, consulate. If anything has changed (rescheduled by the consulate), the site shows the new details.",
        },
        {
          title: "Check the US Embassy/Consulate site for service alerts",
          body:
            "Sometimes consulates close for US holidays you might not know about (Indigenous Peoples Day, etc). Service alerts are posted on the consulate's official page.",
          link: {
            label: "US Embassy/Consulate locator",
            url: "https://www.usembassy.gov/",
          },
        },
        {
          title: "Look up consulate-specific document quirks",
          body:
            "Some consulates have minor specifics: Chennai sometimes asks for affidavit of support in a specific format, Hyderabad sometimes asks for property valuation. Search 'F-1 visa [consulate] documents' on Reddit r/f1visa for current intel.",
        },
        {
          title: "Save the consulate phone + email",
          body:
            "Save the consulate's contact info on paper. If something goes wrong on the day (you're stuck in traffic, document issue), the right phone call can salvage the appointment.",
        },
      ],
    },
    documents: [],
    commonMistakes: [
      {
        title: "Skipping the 48-hour re-check",
        body: "Consulates do reschedule. Students who don't re-check find out at the door that the appointment was moved by 2 days — and they've taken time off work for the wrong day.",
      },
    ],
    whyItMatters:
      "A 20-minute re-check 48 hours before the interview catches the rare-but-real cases where the consulate has changed your appointment, closed for a holiday, or updated document requirements.",
    relatedSteps: [26, 36],
    officialSources: [
      {
        label: "US visa appointment service (find your country)",
        url: "https://www.ustraveldocs.com/",
      },
    ],
  },
  {
    number: 38,
    phase: 4,
    phaseName: "Interview preparation",
    phaseDescription: PHASE_DESC[4],
    title: "Prepare interview-day outfit",
    shortDescription:
      "Smart casual to business casual. No full suit, no jeans. Present as a serious student, not a businessperson.",
    estimatedMinutes: 30,
    documentsNeeded: 0,
    isFree: false,
    hasCriticalTip: false,
    instructions: {
      intro:
        "Officers see hundreds of applicants daily. Outfit isn't judged but does affect first impression. Dress to look serious without over-doing it.",
      steps: [
        {
          title: "Men: collared shirt + trousers + closed shoes",
          body:
            "Light-color button-down, dark trousers, closed-toe leather shoes. Tucked-in shirt. No tie needed. Avoid: jeans, T-shirts, sneakers, sandals.",
        },
        {
          title: "Women: modest top + trousers or skirt",
          body:
            "Conservative top and bottoms, or traditional formal wear appropriate to your culture. Closed-toe shoes. Avoid: clubwear, exposed midriff, flashy jewelry.",
        },
        {
          title: "No full business suits",
          body:
            "A full suit signals 'businessperson visiting US' — not 'student going to study'. The visa is F-1; dress like an F-1.",
        },
        {
          title: "Minimal accessories",
          body:
            "Watch is fine (analog only — smartwatches are banned). One or two simple jewelry pieces. No statement watches, no flashy chains.",
        },
        {
          title: "Iron the outfit the night before",
          body:
            "Wrinkled clothes = looks unprepared. Iron, hang, ready to wear in the morning. The morning of the interview is for breakfast and final review, not laundry.",
        },
      ],
    },
    documents: [],
    commonMistakes: [
      {
        title: "Over-dressing in a suit",
        body: "Officers note 'this person looks like they're going to a corporate meeting, not a master's program'. Minor flag.",
      },
      {
        title: "Under-dressing in casual",
        body: "Jeans + T-shirt signals 'didn't take this seriously'. Officers don't reject for clothing but they do form impressions.",
      },
    ],
    whyItMatters:
      "Outfit is the first non-verbal cue. Looking the part of a serious student helps the first 30 seconds go your way. Doesn't make you pass, but doesn't hurt.",
    relatedSteps: [39, 41],
    officialSources: [
      {
        label: "Interview tips (Study in the States)",
        url: "https://studyinthestates.dhs.gov/students/prepare/visa-interview",
      },
    ],
  },
  {
    number: 39,
    phase: 4,
    phaseName: "Interview preparation",
    phaseDescription: PHASE_DESC[4],
    title: "Final document checklist verification",
    shortDescription:
      "The night-before checklist. Pack the folder. Put it by the door. Don't open it again until the consulate.",
    estimatedMinutes: 45,
    documentsNeeded: 9,
    isFree: false,
    hasCriticalTip: true,
    instructions: {
      intro:
        "The night before the interview, verify every document is in the folder. Pack it. Set it by the door. Morning-of packing is when documents go missing.",
      steps: [
        {
          title: "Run the 9-item checklist",
          body:
            "(1) Current passport (and old passports with US visas). (2) DS-160 confirmation barcode page. (3) SEVIS I-901 receipt. (4) MRV fee receipt. (5) Original signed I-20. (6) Interview appointment letter. (7) Bank statements (3-6 months). (8) Sponsor letter + income proof. (9) Transcripts + degree + ties evidence. (10) Spare photos.",
        },
        {
          title: "Verify each document is the CORRECT VERSION",
          body:
            "DS-160 must be the latest submission's confirmation. SEVIS receipt must match your I-20's SEVIS ID. Bank statements should be the most recent month. Old versions of any document = problem.",
        },
        {
          title: "Pack everything in the tabbed folder",
          body:
            "From step 27, your tabbed folder. Place every document in the right tab. Originals on top, copies behind.",
        },
        {
          title: "Place the folder by the door tonight",
          body:
            "Physical placement matters. The folder by the door cannot be forgotten in the morning rush. Don't put it in your room where you have to remember to grab it.",
        },
        {
          title: "Phone with travel info, but expect to lock it",
          body:
            "Save the consulate address + appointment time + emergency contact on your phone for the morning. Plan to leave the phone in the locker or with parents at the consulate.",
        },
      ],
      outro:
        "Eat dinner. Pack the folder. Sleep early. The interview is at 9 AM, not 5 AM — you don't need to be up at dawn. Rest is more valuable than one more practice round at 11 PM.",
    },
    documents: [
      { key: "passport_packed", name: "Passport (packed)", description: "Verified in folder, top of stack." },
      { key: "ds160_packed", name: "DS-160 confirmation (packed)", description: "Latest version, barcode visible." },
      { key: "sevis_packed", name: "SEVIS receipt (packed)", description: "Matching I-20 SEVIS ID." },
      { key: "mrv_packed", name: "MRV receipt (packed)", description: "Showing the right reference number." },
      { key: "i20_packed", name: "I-20 (packed)", description: "Original, signed by you in student section." },
      { key: "financials_packed", name: "Financials (packed)", description: "Bank statements + sponsor letter + ITRs." },
      { key: "academics_packed", name: "Academic docs (packed)", description: "Transcripts + degree certificate." },
      { key: "ties_packed", name: "Ties evidence (packed)", description: "Property docs, job offer, or family business proof." },
      { key: "photos_packed", name: "Spare photos (packed)", description: "2 spare 2x2 US-spec photos." },
    ],
    commonMistakes: [
      {
        title: "Morning-of packing",
        body: "Rushing under time pressure = missed documents. The folder must be packed and by the door the night before.",
      },
      {
        title: "Bringing the wrong DS-160 confirmation (older version)",
        body: "If you amended the DS-160, the old confirmation's barcode is invalid. Officer's tablet can't match it. Embarrassing reschedule.",
      },
      {
        title: "Forgetting the spare photos",
        body: "If the officer asks for an extra photo (occasionally happens) and you don't have one, the appointment is held while you go find a photo studio.",
      },
    ],
    whyItMatters:
      "The night-before checklist catches the documents you'd otherwise discover were missing AT the consulate window. Catching it at home = 10-minute fix. Catching it at the window = rescheduled interview.",
    relatedSteps: [27, 36, 41],
    officialSources: [
      {
        label: "Required documents (Travel.State.Gov)",
        url: "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html",
      },
    ],
  },
  {
    number: 40,
    phase: 4,
    phaseName: "Interview preparation",
    phaseDescription: PHASE_DESC[4],
    title: "Attend biometrics appointment (if applicable)",
    shortDescription:
      "10 fingerprints + digital photo at the VAC. Bring passport, appointment letter, DS-160. Takes 15 minutes.",
    estimatedMinutes: 45,
    documentsNeeded: 0,
    isFree: false,
    hasCriticalTip: false,
    instructions: {
      intro:
        "Biometrics is brief, mechanical, and uneventful. The data is linked automatically to your application. You don't submit anything — they just collect.",
      steps: [
        {
          title: "Arrive on time at the Visa Application Center (VAC)",
          body:
            "VAC is NOT the consulate. It's a separate office for biometrics + document drop-off. Map the right address.",
        },
        {
          title: "Bring the three required items",
          body:
            "(1) Passport. (2) VAC appointment letter (printed). (3) DS-160 confirmation page (printed). No bags, no electronics — VAC has lockers but minimize what you bring.",
        },
        {
          title: "Expect 10 fingerprints + a digital photo",
          body:
            "Right hand 4 fingers + thumb. Left hand 4 fingers + thumb. Digital headshot. Total time on biometric machine: 5-7 minutes.",
        },
        {
          title: "Verify the receipt before leaving",
          body:
            "VAC gives you a stamped acknowledgment showing biometrics were collected. Keep this — bring to the consulate interview as proof.",
        },
        {
          title: "If biometrics + interview are same day, do biometrics first",
          body:
            "Some consulates schedule both on the same day. Biometrics first, then the consulate interview. The system needs to see biometrics on file before processing the interview.",
        },
      ],
    },
    documents: [],
    commonMistakes: [
      {
        title: "Forgetting the appointment letter",
        body: "VAC turns away walk-ins. Without the printed appointment letter, you're sent home to print.",
      },
      {
        title: "Doing the interview before biometrics on same-day flow",
        body: "Going to consulate first, biometrics second = consulate's system shows 'no biometrics on file' = interview held for processing. Order matters.",
      },
    ],
    whyItMatters:
      "Biometrics must be on file before the consulate can issue the visa. No biometrics = no visa, even with a perfect interview.",
    relatedSteps: [25, 41],
    officialSources: [
      {
        label: "US visa appointment service (find your country)",
        url: "https://www.ustraveldocs.com/",
      },
    ],
  },

  // ============================================================
  // PHASE 5 — Post-approval (steps 41-47)
  // ============================================================
  {
    number: 41,
    phase: 5,
    phaseName: "Post-approval",
    phaseDescription: PHASE_DESC[5],
    title: "Attend visa interview",
    shortDescription:
      "3-7 minutes at the window. Stay calm, speak slowly, answer concisely. Bring everything even if not asked.",
    estimatedMinutes: 120,
    documentsNeeded: 0,
    isFree: false,
    hasCriticalTip: true,
    instructions: {
      intro:
        "The visa interview is over in 3-7 minutes. Most of that time isn't the interview itself — it's waiting. Calm, concise, consistent. That's the formula.",
      steps: [
        {
          title: "Arrive 15-30 minutes early, no later",
          body:
            "Security screening at the consulate takes 10-20 minutes. Bag check, metal detector, document verification. If you arrive at your appointment time, you're late by the time you're through security.",
        },
        {
          title: "Hand over only what's asked for",
          body:
            "Officer asks for passport → hand passport. Asks for I-20 → hand I-20. Don't dump the whole folder. Officers don't appreciate document-spam — it suggests you can't focus.",
        },
        {
          title: "Speak slowly, look at the officer, keep answers under 60 seconds",
          body:
            "Officers interrupt long answers. Aim for 20-40 seconds. Make eye contact. Don't fidget. Don't grip the counter. Calm voice, calm body.",
        },
        {
          title: "When unsure, ask the officer to repeat",
          body:
            "If you didn't catch the question, 'Could you please repeat that?' is fine. Better than answering the wrong question. Officers ask clearer when they realize you're paying attention.",
        },
        {
          title: "Handle the outcomes",
          body:
            "APPROVED: officer keeps passport for visa stamping. 'Your visa is approved' or similar. Don't celebrate at the window. DENIED: officer hands back passport with a section (usually 214(b)). Accept calmly. 221(g): officer hands you a colored slip — pink/white/green — explaining what additional documents or processing are needed. Not a denial; administrative.",
        },
        {
          title: "If you're refused: there is no waiting period, but reapplying unchanged repeats the denial",
          body:
            "A 214(b) refusal isn't a formal ban and there's no mandatory cooling-off period at most posts — you can request a new appointment right away. But showing up again with the same answers, the same documents, and the same ties-to-home story gets the same result. Before you rebook: identify what the officer's cited reason actually was (financial insufficiency vs. weak ties vs. unclear study plan — ask for the refusal sheet/reason if you weren't given a clear one), then find something concrete that's genuinely different this time — a new job offer, stronger property/family documentation, a clearer post-graduation plan, corrected paperwork. A reapplication with no material change is close to a coin flip repeating itself; one with a specific, provable change in circumstances is a real second attempt. Run at least one new mock interview under 'strict officer' mode before rebooking, and flag the prior refusal in Settings so your prep and mock interview scoring account for it specifically.",
        },
      ],
      outro:
        "Bring ALL documents even if you don't expect to be asked. 'I have it here' closes officer questions; 'I don't have it' opens them. The documents are insurance — the strong answer is the policy.",
    },
    documents: [],
    commonMistakes: [
      {
        title: "Over-explaining",
        body: "Long, winding answers signal you're trying to convince. Officers prefer short and direct. 30-40 seconds per answer max.",
      },
      {
        title: "Reaching into the folder uninvited",
        body: "Unsolicited document-dumping is awkward and slows the officer. Wait for the request, then hand it over.",
      },
      {
        title: "Memorized-sounding answers",
        body: "Robotic delivery = officer suspects you're hiding something or were coached. Speak like a conversation, not a recital.",
      },
      {
        title: "Arguing if denied",
        body: "If the officer denies, accept calmly and exit. Arguing at the window doesn't change the outcome — it just makes the experience worse for everyone behind you.",
      },
      {
        title: "Reapplying immediately with an unchanged file",
        body: "Rebooking the next available slot with the exact same documents and answers wastes the appointment and the fee. Fix what was actually weak first — see 'If you're refused' above.",
      },
    ],
    whyItMatters:
      "This is the moment everything before it was prep for. 3-7 minutes that determine whether the next 2-6 years of your life happen in the US or don't. Prep makes this feel automatic. Without prep, it's a coin flip. And if it doesn't go your way, what you do in the following weeks matters as much as the interview itself.",
    relatedSteps: [32, 35, 39, 42],
    officialSources: [
      {
        label: "Interview tips (Study in the States)",
        url: "https://studyinthestates.dhs.gov/students/prepare/visa-interview",
      },
      {
        label: "INA 214(b) overview",
        url: "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/visa-denials.html",
      },
    ],
  },
  {
    number: 42,
    phase: 5,
    phaseName: "Post-approval",
    phaseDescription: PHASE_DESC[5],
    title: "Track passport status after approval",
    shortDescription:
      "Track via ustraveldocs.com. Stages: Received → Under Review → Approved → Dispatched. Typical 2-5 business days.",
    estimatedMinutes: 20,
    documentsNeeded: 0,
    isFree: false,
    hasCriticalTip: false,
    instructions: {
      intro:
        "After the officer says 'approved', your passport stays with the consulate for stamping. Tracking lets you know when it's ready for pickup.",
      steps: [
        {
          title: "Log into ustraveldocs.com (or equivalent) for tracking",
          body:
            "The same site where you booked the interview now shows your visa status. Click 'Track Application'.",
        },
        {
          title: "Watch for stage transitions",
          body:
            "Stage 1: Application Received. Stage 2: Administrative Processing / Under Review (24-72 hours). Stage 3: Issued. Stage 4: Ready for Pickup / Dispatched.",
        },
        {
          title: "Enable SMS notifications if available",
          body:
            "Most visa service sites offer SMS alerts on status change. Worth setting up so you know when to schedule pickup.",
        },
        {
          title: "Don't panic at 'Under Review' for 1-3 days",
          body:
            "Brief administrative processing is normal — 1-3 days. It's not 221(g). Real 221(g) processing lasts weeks and the officer would have given you a colored slip at the interview.",
        },
        {
          title: "Pickup or courier — your choice during booking",
          body:
            "During interview booking, you chose courier delivery or in-person pickup. Once status is 'Dispatched', the pickup location or courier tracking info is available.",
        },
      ],
    },
    documents: [],
    commonMistakes: [
      {
        title: "Refreshing the tracker every hour",
        body: "Status updates daily, not hourly. Excessive checking creates anxiety without information.",
      },
      {
        title: "Missing the SMS / email notification",
        body: "If you didn't enable notifications, you might miss when the passport is ready — delaying pickup and your departure.",
      },
    ],
    whyItMatters:
      "Tracking confirms the visa is genuinely being processed and tells you when to pick up. Without tracking, you guess.",
    relatedSteps: [41, 43],
    officialSources: [
      {
        label: "US visa appointment service (find your country)",
        url: "https://www.ustraveldocs.com/",
      },
    ],
  },
  {
    number: 43,
    phase: 5,
    phaseName: "Post-approval",
    phaseDescription: PHASE_DESC[5],
    title: "Receive passport with stamped visa",
    shortDescription:
      "Collect from courier or VAC. Open immediately and verify every field before the courier leaves.",
    estimatedMinutes: 15,
    documentsNeeded: 1,
    isFree: false,
    hasCriticalTip: true,
    instructions: {
      intro:
        "The stamped visa is delivered in a sealed envelope. Open it immediately, in front of the courier or VAC staff. Errors caught now are fixable; errors caught after you've signed and left are 10x harder.",
      steps: [
        {
          title: "Verify identity at pickup (courier or VAC)",
          body:
            "Bring ID and the pickup receipt. Courier requires ID at delivery. VAC requires the tracking number + ID.",
        },
        {
          title: "Open the envelope immediately",
          body:
            "Don't wait until you get home. Open it in front of the courier/VAC staff so any issue is documented immediately.",
        },
        {
          title: "Flip to the visa page in the passport",
          body:
            "Visa is stamped on a fresh passport page, usually near the back. Color photo + your details + 'F-1' designation + validity dates + entries (typically 'M' for multiple).",
        },
        {
          title: "Compare every field against the I-20 and passport bio",
          body:
            "Name spelling, DOB, passport number, F-1 visa class, valid-from date, valid-until date, number of entries. All must match.",
        },
        {
          title: "If wrong, report within 24 hours",
          body:
            "Email the consulate's visa unit with the error, photo of the visa, and your case number. After 24 hours, corrections become much harder and slower.",
        },
      ],
    },
    documents: [
      {
        key: "passport_with_visa",
        name: "Passport with stamped F-1 visa",
        description:
          "The stamped F-1 visa in your passport. Must show F-1 class, validity dates, entries, and your photo matching the bio page.",
        expiryRelevant: true,
      },
    ],
    commonMistakes: [
      {
        title: "Signing for delivery without opening the envelope",
        body: "Once you sign as 'received', error reports become much harder. Open and verify FIRST, then sign.",
      },
      {
        title: "Not catching wrong visa type (B1/B2 instead of F-1)",
        body: "Wrong visa type = you cannot start the F-1 program. Catching this within 24 hours of receipt gets a faster correction than catching it on travel day.",
      },
    ],
    whyItMatters:
      "Errors in the printed visa are uncommon but real. Catching them on the day of pickup is recoverable. Catching them at the airport gate is catastrophic.",
    relatedSteps: [42, 44, 45],
    officialSources: [
      {
        label: "US visa appointment service (find your country)",
        url: "https://www.ustraveldocs.com/",
      },
    ],
  },
  {
    number: 44,
    phase: 5,
    phaseName: "Post-approval",
    phaseDescription: PHASE_DESC[5],
    title: "Verify visa details for accuracy",
    shortDescription:
      "Class must be F-1, validity covers your I-20 program, entries 'M' (multiple), name/DOB match passport.",
    estimatedMinutes: 15,
    documentsNeeded: 1,
    isFree: false,
    hasCriticalTip: true,
    instructions: {
      intro:
        "Final verification before travel. Five fields on the visa, three minutes of checking — saves a denied boarding at the airport.",
      steps: [
        {
          title: "Visa class: must say 'F-1'",
          body:
            "If it says B1, B2, B1/B2, J1, or anything else, it's wrong. Different visa type = you cannot start the F-1 program. Contact DSO and the consulate immediately.",
        },
        {
          title: "Valid from date and validity period",
          body:
            "Valid-from date is when you can first travel on this visa. Validity period varies significantly by home country — check your visa sticker for the exact validity window. Travel up to the validity-end date.",
        },
        {
          title: "Entries: should be 'M' (multiple)",
          body:
            "Most F-1 visas are 'M' (multiple entries) — you can leave and return throughout the validity period. Single-entry F-1 visas are unusual; if you got one, plan trips back home carefully.",
        },
        {
          title: "Name and DOB match passport bio page exactly",
          body:
            "Compare visa to passport bio. Even a one-character spelling difference is a defect — fix before you travel.",
        },
        {
          title: "Plan first US entry within 30 days of I-20 program start",
          body:
            "Independent of visa validity, you cannot enter the US more than 30 days before your I-20 program start date. CBP enforces this strictly.",
        },
      ],
    },
    documents: [
      {
        key: "passport_with_visa",
        name: "Passport with stamped F-1 visa (verified)",
        description: "Verified for class, validity, entries, name/DOB match.",
        expiryRelevant: true,
      },
    ],
    commonMistakes: [
      {
        title: "Not noticing 'F-2' or 'B1/B2' on the visa",
        body: "Wrong class = wrong visa type = denied boarding. Always check the visa class explicitly.",
      },
      {
        title: "Booking travel for >30 days before program start",
        body: "Visa allows it but CBP doesn't. You'll be sent home from the airport. Book travel for within 30 days of program start.",
      },
    ],
    whyItMatters:
      "Last chance to catch visa errors before travel. Errors caught now = days to fix. Errors caught at the airport = denied boarding, weeks to fix, missed program start.",
    relatedSteps: [43, 45],
    officialSources: [
      {
        label: "F-1 visa overview (Travel.State.Gov)",
        url: "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html",
      },
    ],
  },
  {
    number: 45,
    phase: 5,
    phaseName: "Post-approval",
    phaseDescription: PHASE_DESC[5],
    title: "Complete pre-departure preparations",
    shortDescription:
      "Flight within the 30-day window, housing locked, USD cash on hand, bank notified, insurance set up.",
    estimatedMinutes: 240,
    documentsNeeded: 0,
    isFree: false,
    hasCriticalTip: false,
    instructions: {
      intro:
        "Pre-departure is logistics-heavy. Spend a focused day on flight + housing + money + communications, then your first US week becomes manageable instead of chaotic.",
      steps: [
        {
          title: "Book flight to land within 30 days of I-20 program start",
          body:
            "Calculate: I-20 start date - 30 days = earliest CBP allows entry. Book a flight landing 5-10 days before program start — enough buffer to settle in but within the 30-day window.",
        },
        {
          title: "Confirm housing for first week minimum",
          body:
            "If on-campus housing isn't ready yet, book Airbnb/hotel for the first 5-7 days near campus. Don't land in the US without a place to sleep.",
        },
        {
          title: "Carry $500-1000 USD in cash",
          body:
            "Immediate expenses: SIM card, transit to campus, first meals. USD cash from your home country's foreign exchange (better rates than US airport exchanges). Distribute across wallet + jacket + bag in case of theft.",
        },
        {
          title: "Notify your bank of international travel",
          body:
            "Call your home-country bank to flag international travel for your credit/debit cards. Without notification, cards get auto-blocked on first US transaction.",
        },
        {
          title: "Set up international health insurance for travel days",
          body:
            "If your university's insurance starts on the program start date, you may have a 5-10 day gap. Buy a short-term travel medical insurance policy for those days. Hospital visit without insurance = catastrophic bill.",
        },
        {
          title: "Download offline Google Maps for your university area",
          body:
            "No SIM = no GPS unless maps are downloaded offline. Save the campus + dorm + nearest grocery + nearest pharmacy.",
        },
      ],
    },
    documents: [],
    commonMistakes: [
      {
        title: "Landing without a place to sleep",
        body: "Arriving in a new country at 11 PM without housing booked = scrambling for a hotel near campus at midnight. Book the first week minimum.",
      },
      {
        title: "Bank cards blocked on arrival",
        body: "Your home bank sees an unusual overseas transaction and assumes fraud, auto-blocking the card. Call the bank before travel to whitelist US.",
      },
      {
        title: "No cash buffer for first 24 hours",
        body: "Cards declined at the airport, no Uber app set up, no SIM = stranded. $500 cash buffer solves all of these.",
      },
    ],
    whyItMatters:
      "Pre-departure prep is what separates students who land smoothly from students whose first 48 hours are a panic. The visa is the ticket; pre-departure is the landing plan.",
    relatedSteps: [44, 46, 47],
    officialSources: [
      {
        label: "Pre-arrival info (Study in the States)",
        url: "https://studyinthestates.dhs.gov/students/study/getting-to-the-united-states",
      },
    ],
  },
  {
    number: 46,
    phase: 5,
    phaseName: "Post-approval",
    phaseDescription: PHASE_DESC[5],
    title: "Validate SEVIS upon US arrival",
    shortDescription:
      "Present passport + I-20 at CBP together. Get I-94 from i94.cbp.dhs.gov within 24h. Class 'F-1', admit-until 'D/S'.",
    estimatedMinutes: 30,
    documentsNeeded: 0,
    isFree: false,
    hasCriticalTip: true,
    instructions: {
      intro:
        "SEVIS activation happens at CBP when you enter. The validation is automatic IF you present the right documents in the right way. Doing this wrong = months of status confusion later.",
      steps: [
        {
          title: "At CBP, hand over passport AND I-20 together",
          body:
            "Many students hand over only the passport. Wrong. CBP needs the I-20 to scan your SEVIS record. 'Passport AND I-20 please' — say it.",
        },
        {
          title: "Expect the secondary questioning room (sometimes)",
          body:
            "First-time F-1 entrants are sometimes sent to secondary inspection — not a problem, just an extra check. Bring your interview folder so you have docs handy if asked.",
        },
        {
          title: "Get the F-1 admission stamp",
          body:
            "CBP stamps your passport with 'F-1' class and 'D/S' (Duration of Status) admit-until date. D/S means you're in status as long as you maintain full-time enrollment.",
        },
        {
          title: "Download your I-94 within 24 hours",
          body:
            "Go to i94.cbp.dhs.gov, enter passport number + name + DOB, download the I-94 PDF. This is your official admission record.",
          link: {
            label: "I-94 portal (CBP)",
            url: "https://i94.cbp.dhs.gov",
          },
        },
        {
          title: "Verify I-94 says 'F-1' and 'D/S'",
          body:
            "Class of admission: F-1. Admit until date: D/S. If you see anything else — B1/B2, B2, an actual date instead of D/S — contact your DSO that day. Don't wait. Status errors compound.",
        },
      ],
      outro:
        "If your I-94 is wrong, your DSO can request CBP to fix it via deferred inspection — but only if you report within days, not weeks.",
    },
    documents: [
      {
        key: "i94_record",
        name: "I-94 arrival record",
        description:
          "Digital I-94 downloaded from i94.cbp.dhs.gov within 24 hours of arrival. Must show class F-1 and admit-until D/S.",
      },
    ],
    commonMistakes: [
      {
        title: "Handing only the passport at CBP",
        body: "Without the I-20, CBP can't scan your SEVIS record. They issue the stamp anyway, but SEVIS isn't activated until your school manually checks you in — adding weeks of confusion.",
      },
      {
        title: "Not checking the I-94 within 24 hours",
        body: "Status errors on the I-94 (wrong class, wrong admit-until) are fixable in the first week. Discovered in week 4: harder. Discovered in semester 2: very hard.",
      },
      {
        title: "Going to baggage claim before SEVIS validation is complete",
        body: "If CBP held you in secondary for SEVIS validation and you wander off, the process is incomplete. Stay until the officer says 'you're free to go'.",
      },
    ],
    whyItMatters:
      "SEVIS activation at CBP is what makes your F-1 status legal. Without it, you're in the US on an unactivated visa — a status gap that surfaces months later when you apply for an SSN, CPT, or OPT. Get it right at the airport.",
    relatedSteps: [44, 47],
    officialSources: [
      {
        label: "I-94 portal (CBP)",
        url: "https://i94.cbp.dhs.gov",
      },
      {
        label: "F-1 entry (Study in the States)",
        url: "https://studyinthestates.dhs.gov/students/study/getting-to-the-united-states",
      },
    ],
  },
  {
    number: 47,
    phase: 5,
    phaseName: "Post-approval",
    phaseDescription: PHASE_DESC[5],
    title: "Complete first-week-in-US essentials",
    shortDescription:
      "Check-in with international office, university ID, US bank, SSN if employed, US SIM, F-1 maintenance rules.",
    estimatedMinutes: 480,
    documentsNeeded: 0,
    isFree: false,
    hasCriticalTip: false,
    instructions: {
      intro:
        "The first week sets the rhythm. Done well: you're set up for the semester. Done poorly: you're patching emergencies into week 4. Knock these out in order.",
      steps: [
        {
          title: "Check in with the international student office (within 15 days)",
          body:
            "Every school requires F-1 students to check in within a specific window — usually 15 days of arrival. Missing this triggers SEVIS termination automatically. The DSO needs to see your passport + I-20 + I-94 in person.",
        },
        {
          title: "Activate university ID, email, building access",
          body:
            "ID card unlocks dorms, library, gym. Email is your primary communication with the school. Activate both on day 1 — don't wait until week 2.",
        },
        {
          title: "Open a US bank account",
          body:
            "Chase, Bank of America, Wells Fargo, and BoA all accept international students. Bring: passport + I-20 + I-94 + university address. Some banks require an SSN; those don't, so ask before picking one. Account opens same day.",
        },
        {
          title: "Apply for SSN if you have on-campus employment",
          body:
            "F-1 students with on-campus jobs (TA, RA, dining hall, library) need an SSN. Visit the Social Security Administration with: passport + I-20 + I-94 + employment offer letter + DSO certification. SSN arrives by mail in 2-4 weeks.",
        },
        {
          title: "Get a US SIM (Mint Mobile or T-Mobile prepaid)",
          body:
            "Mint Mobile prepaid plans start at $15/month. T-Mobile Connect $15/month. Activate online before arrival OR walk into a store with passport. eSIM is easiest.",
        },
        {
          title: "Understand F-1 status maintenance",
          body:
            "Maintain full-time enrollment every semester (typically 12 credits undergrad, 9 grad). No unauthorized off-campus work. Report address changes to DSO within 10 days. Carry passport + I-94 + I-20 when traveling within the US.",
        },
      ],
    },
    documents: [],
    commonMistakes: [
      {
        title: "Missing the international office check-in window",
        body: "If you don't check in by day 15 (or your school's specified window), SEVIS auto-terminates your status. Reinstatement is possible but costly and takes months.",
      },
      {
        title: "Working off-campus without authorization",
        body: "Unauthorized off-campus work is the single biggest F-1 violation. Caught = SEVIS termination + immediate visa revocation + 3-10 year bar. Even 'a side gig' counts.",
      },
      {
        title: "Not reporting address changes within 10 days",
        body: "F-1 students must update DSO with address changes within 10 days. Not doing so is a minor SEVIS violation that compounds if patterns of non-reporting emerge.",
      },
      {
        title: "Letting university health insurance lapse",
        body: "Most schools auto-enroll you in their health plan. Some require manual enrollment. Lapsed insurance + hospital visit = $20,000 ER bill. Verify on day 1.",
      },
    ],
    whyItMatters:
      "F-1 status violations in week 1 are far more common than students expect. Missing the international office check-in, taking unauthorized work, failing to report addresses — these are the violations that quietly compound and haunt you for the rest of your student career. Do the first week right.",
    relatedSteps: [46],
    officialSources: [
      {
        label: "Maintaining F-1 status",
        url: "https://studyinthestates.dhs.gov/students/prepare/maintaining-your-status",
      },
      {
        label: "Social Security for F-1 students",
        url: "https://www.ssa.gov/ssnumber/ss5doc.htm",
      },
      {
        label: "I-94 portal (CBP)",
        url: "https://i94.cbp.dhs.gov",
      },
    ],
  },
];

export const TOTAL_STEPS = 47;

export function stepByNumber(n: number): Step | undefined {
  return STEPS.find((s) => s.number === n);
}

/* ============================================================
   Legacy adapters — derive the old string-shape fields from the
   rich Step structure so existing consumers keep working. Passing
   homeCountry resolves any country-specific overrides on top of the
   universal text (see lib/resolveStepContent.ts); omitting it keeps
   the original universal-only behavior.
   ============================================================ */

export function stepInstructionsText(s: Step, homeCountry?: HomeCountryCode | null): string {
  const resolved = resolveStepContent(s, homeCountry ?? null);
  const lines: string[] = [resolved.instructions.intro.text];
  resolved.instructions.steps.forEach((step, i) => {
    lines.push(`${i + 1}. ${step.title}: ${step.body.text}`);
  });
  if (resolved.instructions.outro) lines.push(resolved.instructions.outro.text);
  return lines.join("\n\n");
}

export function stepMistakesText(s: Step, homeCountry?: HomeCountryCode | null): string[] {
  const resolved = resolveStepContent(s, homeCountry ?? null);
  return resolved.commonMistakes.map((m) => `${m.title}: ${m.body.text}`);
}

export function stepTipsText(s: Step, homeCountry?: HomeCountryCode | null): string[] {
  const resolved = resolveStepContent(s, homeCountry ?? null);
  return [resolved.whyItMatters, ...resolved.commonMistakes.map((m) => m.title)];
}
