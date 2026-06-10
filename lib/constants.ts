/**
 * The 47-step F-1 visa process — canonical content for the landing page
 * and (later) the actual product. Grouped into 5 phases.
 *
 * Every step now carries a short detail paragraph so the timeline can
 * open as an accordion (Section 3) — substance is visible, not hidden.
 */

export type Step = {
  title: string;
  detail: string;
};

export type Phase = {
  id: string;
  label: string; // e.g. "PHASE 01"
  name: string;
  description: string;
  steps: Step[];
};

export const PHASES: Phase[] = [
  {
    id: "before-i20",
    label: "PHASE 01",
    name: "Before your I-20",
    description:
      "Where the journey begins. Choosing where to apply and securing your admission.",
    steps: [
      {
        title: "Choose universities matching your profile",
        detail:
          "Build a shortlist of 8–12 schools across reach, target, and safety tiers. Your profile means test scores, transcripts, intended major, budget, and the post-graduation outcomes you actually care about. Most applicants overweight rankings and underbuild the list.",
      },
      {
        title: "Take required tests (TOEFL/IELTS, SAT/GRE/GMAT)",
        detail:
          "Schedule tests at least four months before your earliest application deadline so you keep a retake window. TOEFL or IELTS covers English; SAT is for undergrad; GRE or GMAT for grad programs. Score requirements vary widely — verify each program individually.",
      },
      {
        title: "Submit applications and receive admission",
        detail:
          "Common App handles many undergrad programs; grad programs are direct-to-school. Beyond the form you'll need transcripts, recommendation letters, statement of purpose, and a per-school application fee. Decisions take 2 weeks to 4 months depending on the program.",
      },
      {
        title: "Compare financial aid packages",
        detail:
          "Compare net cost after scholarships and assistantships, not headline tuition. Factor in housing, mandatory health insurance, and the fact that F-1 students cannot work off-campus. A more expensive school with a strong stipend can be cheaper end-to-end.",
      },
      {
        title: "Accept your offer and confirm enrollment",
        detail:
          "Most US schools require an enrollment deposit (commonly $300–$1,000) by May 1 to lock your seat. Once paid, withdraw applications elsewhere and notify those schools. Your accepted university then begins the I-20 issuance process.",
      },
      {
        title: "Receive your I-20 from your university",
        detail:
          "The I-20 is the SEVP-issued document confirming admission, program details, and funding. Most schools courier it within 2–4 weeks of enrollment confirmation. Without it you cannot pay the SEVIS fee or schedule a visa interview.",
      },
    ],
  },
  {
    id: "after-i20",
    label: "PHASE 02",
    name: "After I-20 arrival",
    description:
      "The moment your I-20 lands, the visa clock starts. Eight foundation tasks before you touch the DS-160.",
    steps: [
      {
        title: "Verify all I-20 details for accuracy",
        detail:
          "Check name, date of birth, program name, start date, and SEVIS ID against your passport and admission letter. A single typo can void the document. If anything is wrong, email your DSO immediately for a corrected I-20.",
      },
      {
        title: "Pay the SEVIS I-901 fee",
        detail:
          "$350 paid online at FMJfee.com using the SEVIS ID from your I-20. The payment is non-refundable and tied to your specific I-20. You cannot schedule a visa interview without this receipt.",
      },
      {
        title: "Print SEVIS payment receipt",
        detail:
          "Save and print at least two copies — the consular officer keeps one and you carry one. The PDF arrives by email within 24 hours. Lost receipts can be re-downloaded from FMJfee.com.",
      },
      {
        title: "Gather passport and identity documents",
        detail:
          "Your passport must be valid for at least six months beyond your intended US stay. Bring birth certificate (translated if not in English), national ID, and any prior passports. Photocopy everything — three sets is the conservative standard.",
      },
      {
        title: "Compile financial proof documents",
        detail:
          "Show ability to fund at least the first year on your I-20. Acceptable: bank statements (last six months), fixed deposit certificates, sponsor affidavits, education loan sanction letters. The exact list varies by consulate.",
      },
      {
        title: "Organize academic transcripts and certificates",
        detail:
          "Original transcripts from every institution attended, plus standardized test scorecards. Some consulates ask for original degree certificates; others accept attested copies. Keep digital backups on a USB drive.",
      },
      {
        title: "Prepare ties-to-home-country evidence",
        detail:
          "F-1 is a non-immigrant visa: you must show intent to return after studies. Useful: family financial obligations, property documents, conditional job offers, ongoing family business. The officer reads body language as much as paperwork.",
      },
      {
        title: "Get passport-sized photos meeting US specs",
        detail:
          "2×2 inches, white background, taken within the last six months, no glasses, neutral expression. Photo studios near consulates offer this exact spec. You'll need physical prints for the interview and a digital file for the DS-160 upload.",
      },
    ],
  },
  {
    id: "ds160",
    label: "PHASE 03",
    name: "DS-160 and fees",
    description:
      "The form that intimidates everyone. We break it into twelve clear stages.",
    steps: [
      {
        title: "Create CEAC account on US State Department site",
        detail:
          "Visit ceac.state.gov/genniv. Pick the correct embassy or consulate for your interview location — this is locked once you start. Note your application ID; you'll need it to save and resume.",
      },
      {
        title: "Begin DS-160 form with personal information",
        detail:
          "Name (exactly as on passport), birth details, nationality, address, contact info. Use the same email throughout. Save your progress every page — the form times out after 20 minutes of inactivity.",
      },
      {
        title: "Complete travel and US contact sections",
        detail:
          "Intended arrival date, US address (your school address is acceptable if you don't have housing yet), and the arranger of the trip. List your university as the US contact if you don't yet have a host.",
      },
      {
        title: "Fill family and education sections",
        detail:
          "Parents' names, dates of birth, places of birth — all required. List every institution since secondary school in reverse chronological order, including months attended. Gaps need explanations later in the interview.",
      },
      {
        title: "Complete work, training, and security sections",
        detail:
          "Current and previous employers (last five years), military service, prior US visits and visa history. Security questions are yes/no on terrorism, drug trafficking, and similar — answer truthfully. Deception here is grounds for permanent inadmissibility.",
      },
      {
        title: "Upload photo to DS-160",
        detail:
          "Same 2×2 spec as physical photos: 600×600 to 1200×1200 px JPEG, under 240 KB, white background, no glasses. The site rejects non-compliant uploads instantly. If upload fails, you can present the physical photo at the interview.",
      },
      {
        title: "Review and submit DS-160",
        detail:
          "Re-read every page carefully — corrections after submission require starting a brand-new application. Submit, then download and print the confirmation page with the barcode. Note the application ID for appointment booking.",
      },
      {
        title: "Print DS-160 confirmation page with barcode",
        detail:
          "The barcode is what the officer scans at the interview window. Print on plain white paper, at least two copies. The full DS-160 PDF is not needed at the interview — only this confirmation page.",
      },
      {
        title: "Create profile on US visa service site for your country",
        detail:
          "A separate site (commonly USTravelDocs or AIS), operated by the third party that runs appointments in your country. Use the same name and DOB as your passport and DS-160. You'll link your DS-160 confirmation here.",
      },
      {
        title: "Pay the MRV visa application fee",
        detail:
          "$185 for F-1 visas. Payment methods vary by country — bank transfer, online card, designated branch deposit. The receipt or transaction number unlocks appointment booking and usually takes 1–2 business days to clear.",
      },
      {
        title: "Schedule biometrics appointment (if required)",
        detail:
          "Some consulates require fingerprints and a photo at a Visa Application Center before the interview. Book this 2–3 days before your interview so biometrics are on file when you arrive. Many consulates have eliminated this step — confirm for yours.",
      },
      {
        title: "Schedule visa interview appointment",
        detail:
          "Pick the earliest slot that still gives you preparation time. Wait times vary dramatically by consulate — days to months. Booking too close to your I-20 start date is risky if you face administrative processing.",
      },
    ],
  },
  {
    id: "interview-prep",
    label: "PHASE 04",
    name: "Interview preparation",
    description:
      "The longest phase. The one where most applicants underprepare.",
    steps: [
      {
        title: "Organize all required documents in folder order",
        detail:
          "A clear plastic folder with documents in the order the officer is likely to ask: passport, I-20, DS-160 confirmation, SEVIS receipt, financial docs, admission letter, transcripts, test scores. Avoid staples and binders — officers want to flip quickly.",
      },
      {
        title: "Prepare academic statement explaining your program",
        detail:
          "Be able to explain in two to three sentences what you're studying, why this specific program, and what specific career outcome it serves. Officers test whether you actually understand your own plan. Vague answers raise flags.",
      },
      {
        title: "Document your university selection rationale",
        detail:
          "Why this university over others that admitted you? Be specific: faculty research, program structure, industry connections, location relative to your career goal. \"It's a good school\" is the worst possible answer.",
      },
      {
        title: "Prepare financial sponsor documentation",
        detail:
          "If parents are sponsoring, bring their tax returns, bank statements, employment letters, and a signed affidavit of support. If using education loans, the sanction letter must show the full amount and terms. Funding gaps are the number-one reason for refusals.",
      },
      {
        title: "Document return-to-home-country ties",
        detail:
          "Specific evidence: family business succession plans, property in your name, conditional job offers tied to your degree, ongoing family obligations. Vague claims like \"I love my country\" do not count as ties.",
      },
      {
        title: "Practice answering common interview questions",
        detail:
          "Why this university, why this program, who's funding you, what you plan to do after graduation, why not study at home. Aim for two-sentence answers — officers interview 80+ people a day and value brevity.",
      },
      {
        title: "Complete first mock interview",
        detail:
          "Have someone in a formal setting ask the standard questions in English, with no script. Record yourself if you can. The goal is to surface filler words, evasive phrasing, and gaps you didn't notice.",
      },
      {
        title: "Review and refine answers based on feedback",
        detail:
          "From mock 1, identify your three weakest answers and rewrite them. Don't memorize — internalize the structure. Practice walking through your story end-to-end in about 90 seconds.",
      },
      {
        title: "Complete second mock interview",
        detail:
          "Use a different person this time — fresh eyes catch different issues. Aim for shorter, more confident answers than the first round. By now your delivery should sound like a conversation, not a recital.",
      },
      {
        title: "Plan your interview day logistics",
        detail:
          "Travel route to the consulate, parking or transit, and arrival time (most consulates want you 15 minutes early, no earlier). Charge your phone. Eat something — interviews can run hours past the scheduled time.",
      },
      {
        title: "Confirm consulate location and timing",
        detail:
          "The address on your appointment letter is the truth — Google Maps sometimes lists wrong consular sections. Walk or drive past the building the day before if possible. Phones are typically not allowed inside.",
      },
      {
        title: "Prepare interview-day outfit",
        detail:
          "Business casual is the safe default — collared shirt, slacks, closed shoes. Avoid bright logos and anything you'd be uncomfortable standing in for three hours. The goal is to remove every distraction the officer might fixate on.",
      },
      {
        title: "Final document checklist verification",
        detail:
          "The night before: passport, DS-160 confirmation, SEVIS receipt, I-20 (signed by your DSO), photo, appointment letter, fee receipts, financial documents. Cross-check against your consulate's specific list one more time.",
      },
      {
        title: "Attend biometrics appointment (if applicable)",
        detail:
          "Fingerprints take under ten minutes if you booked correctly. Bring your passport and appointment letter. The visa center confirms your data is on file with the consulate before your interview.",
      },
    ],
  },
  {
    id: "post-approval",
    label: "PHASE 05",
    name: "Post-approval",
    description:
      "The visa is stamped. Now the real preparation begins.",
    steps: [
      {
        title: "Attend visa interview",
        detail:
          "Arrive 15 minutes early. Be polite, direct, and confident — short answers, eye contact, no over-explaining. The interview itself is typically under five minutes; the decision is usually given on the spot.",
      },
      {
        title: "Track passport status after approval",
        detail:
          "Most consulates send your passport to a pickup center or by courier within 5–10 business days of approval. Track via the same site you used to book the appointment. Watch for administrative processing notices (221(g)) — these add weeks.",
      },
      {
        title: "Receive passport with stamped visa",
        detail:
          "Verify the visa is in your passport and the consulate didn't keep your I-20. Check the visa expiration date — F-1 visas vary by country (5 days to 5 years). If anything is wrong, contact the consulate immediately.",
      },
      {
        title: "Verify visa details for accuracy",
        detail:
          "Name spelling, DOB, photo, visa class (F1), entries (M for multiple is standard), and expiration. The visa lets you enter the US; the I-20 governs how long you can stay. If the visa is wrong, request a correction before you travel.",
      },
      {
        title: "Complete pre-departure preparations",
        detail:
          "Book travel for no more than 30 days before your program start date — the earliest CBP will admit you. Notify your university of arrival. Pack academic documents in carry-on; never in checked baggage.",
      },
      {
        title: "Validate SEVIS upon US arrival",
        detail:
          "At the port of entry, CBP scans your I-20 which activates your SEVIS record. Always present your I-20 with your passport, never separately. Your I-94 (electronic arrival record) is issued at admission.",
      },
      {
        title: "Complete first-week-in-US essentials",
        detail:
          "Within the first 30 days you must check in with your university's international office, attend orientation, and confirm enrollment. Get a US phone number, open a bank account, and locate the nearest Social Security office if you plan to work on campus.",
      },
    ],
  },
];

export const TOTAL_STEPS = PHASES.reduce((n, p) => n + p.steps.length, 0); // 47
