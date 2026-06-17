/**
 * F-1 document checklist — single source of truth.
 *
 * Each entry drives:
 *   - The seeded `documents` rows for a new user (status='missing')
 *   - Display copy on /dashboard/documents
 *   - The per-document AI vision prompt (vision.ts)
 *
 * Phase 5 is intentionally NOT seeded — unlocked post-approval.
 */

export type ChecklistItem = {
  slug: string;
  display_name: string;
  why: string;
  phase: 1 | 2 | 3 | 4;
  acceptedFormats: ("pdf" | "jpg" | "png")[];
  /** Hints passed to the vision model — what should be visible. */
  aiExpectations: {
    /** One-line description for the model to match against. */
    documentDescription: string;
    /** Required visual elements the model should look for. */
    requiredElements: string[];
    /** Whether to extract an expiry date. */
    checkExpiry?: boolean;
  };
};

export const CHECKLIST: ChecklistItem[] = [
  // ------------------------------ Phase 1 -----------------------------------
  {
    slug: "passport-bio",
    display_name: "Passport (bio page)",
    why: "Officers verify your identity and check passport validity covers your full stay plus six months.",
    phase: 1,
    acceptedFormats: ["pdf", "jpg", "png"],
    aiExpectations: {
      documentDescription: "The photo/bio page of a national passport showing personal details and MRZ.",
      requiredElements: ["passport photo of the holder", "full name", "date of birth", "passport number", "two MRZ lines at the bottom", "expiry date"],
      checkExpiry: true,
    },
  },
  {
    slug: "marksheet-10",
    display_name: "10th grade marksheet",
    why: "Confirms your academic history. Some consulates ask to see early-year grades.",
    phase: 1,
    acceptedFormats: ["pdf", "jpg", "png"],
    aiExpectations: {
      documentDescription: "A school-issued 10th grade (Class X / SSC / equivalent) marksheet or transcript.",
      requiredElements: ["student name", "school or board name", "subject-wise marks or grades", "year/date of issue"],
    },
  },
  {
    slug: "marksheet-12",
    display_name: "12th grade marksheet",
    why: "Your most recent secondary school transcript. Officers compare GPA to admission claims.",
    phase: 1,
    acceptedFormats: ["pdf", "jpg", "png"],
    aiExpectations: {
      documentDescription: "A school-issued 12th grade (Class XII / HSC / equivalent) marksheet or transcript.",
      requiredElements: ["student name", "school or board name", "subject-wise marks or grades", "year/date of issue"],
    },
  },
  {
    slug: "degree-transcript",
    display_name: "Degree / university transcripts",
    why: "Required for Master's and PhD applicants; supports your admission profile.",
    phase: 1,
    acceptedFormats: ["pdf", "jpg", "png"],
    aiExpectations: {
      documentDescription: "An undergraduate or graduate transcript showing courses, credits, and GPA.",
      requiredElements: ["student name", "university name", "course list with grades", "GPA or CGPA"],
    },
  },

  // ------------------------------ Phase 2 -----------------------------------
  {
    slug: "i20",
    display_name: "Form I-20",
    why: "The single most important document. Issued by your university — proves SEVIS registration.",
    phase: 2,
    acceptedFormats: ["pdf"],
    aiExpectations: {
      documentDescription: "Form I-20 'Certificate of Eligibility for Nonimmigrant Student Status' from a U.S. school.",
      requiredElements: ["SEVIS ID starting with N", "school name and address", "program of study", "designated school official (DSO) signature line", "student signature line", "estimated cost section"],
    },
  },
  {
    slug: "sevis-receipt",
    display_name: "SEVIS I-901 fee receipt",
    why: "Officers ask for it within seconds of you sitting down. No receipt = no interview.",
    phase: 2,
    acceptedFormats: ["pdf"],
    aiExpectations: {
      documentDescription: "I-901 SEVIS fee payment receipt printed from FMJfee.com.",
      requiredElements: ["I-901 receipt number", "student name matching the I-20", "amount paid", "date of payment", "school name"],
    },
  },
  {
    slug: "admission-letter",
    display_name: "Admission / acceptance letter",
    why: "Direct evidence that the I-20 is backed by a real offer.",
    phase: 2,
    acceptedFormats: ["pdf"],
    aiExpectations: {
      documentDescription: "An official acceptance or admission letter from a U.S. university.",
      requiredElements: ["university letterhead", "student name", "program of admission", "term of admission", "signature or seal"],
    },
  },

  // ------------------------------ Phase 3 -----------------------------------
  {
    slug: "ds160-confirmation",
    display_name: "DS-160 confirmation page",
    why: "The barcode on this page is scanned at the consulate window. Carry the printout.",
    phase: 3,
    acceptedFormats: ["pdf"],
    aiExpectations: {
      documentDescription: "The DS-160 nonimmigrant visa application confirmation page from the U.S. Department of State.",
      requiredElements: ["barcode at the top", "10-character DS-160 confirmation number starting with AA", "applicant name", "photograph", "submission date"],
    },
  },
  {
    slug: "visa-fee-receipt",
    display_name: "Visa fee (MRV) receipt",
    why: "Required to schedule your interview. Officers verify the receipt against your appointment.",
    phase: 3,
    acceptedFormats: ["pdf"],
    aiExpectations: {
      documentDescription: "An MRV (Machine Readable Visa) fee payment receipt for a U.S. nonimmigrant visa.",
      requiredElements: ["receipt or reference number", "amount paid in USD or local currency", "date of payment", "applicant name"],
    },
  },
  {
    slug: "us-visa-photo",
    display_name: "US visa photo (2x2 in)",
    why: "Strict spec: 2x2 inches, white background, taken in the last 6 months, no glasses, neutral expression.",
    phase: 3,
    acceptedFormats: ["jpg", "png"],
    aiExpectations: {
      documentDescription: "A passport-style headshot photo conforming to U.S. visa specifications.",
      requiredElements: ["square 1:1 aspect ratio", "plain white or off-white background", "face centered and unobstructed", "no eyeglasses", "neutral expression", "ears visible"],
    },
  },

  // ------------------------------ Phase 4 -----------------------------------
  {
    slug: "bank-statement",
    display_name: "Bank statements (last 6 months)",
    why: "Shows the funds named on your I-20 actually exist — and weren't deposited yesterday.",
    phase: 4,
    acceptedFormats: ["pdf"],
    aiExpectations: {
      documentDescription: "A bank-issued statement covering at least the last six months for the account funding the student.",
      requiredElements: ["bank name and logo", "account holder name", "statement period dates", "opening and closing balances", "transaction history"],
    },
  },
  {
    slug: "loan-or-scholarship",
    display_name: "Loan / scholarship letter",
    why: "If part of your funding is loaned or scholarship-backed, the consulate wants the original letter.",
    phase: 4,
    acceptedFormats: ["pdf"],
    aiExpectations: {
      documentDescription: "An education loan sanction letter from a bank, or a scholarship award letter from the university or sponsor.",
      requiredElements: ["lender or sponsor name and letterhead", "student name", "amount sanctioned or awarded", "terms (duration, disbursement)", "official signature or stamp"],
    },
  },
  {
    slug: "sponsor-docs",
    display_name: "Sponsor docs (ITR / CA certificate)",
    why: "If a parent is sponsoring, the officer wants tax returns or a chartered accountant's affidavit.",
    phase: 4,
    acceptedFormats: ["pdf"],
    aiExpectations: {
      documentDescription: "An income tax return summary or a chartered accountant's certificate of net worth for the student's sponsor.",
      requiredElements: ["sponsor's full name", "assessment year or certificate date", "income figures or net worth", "issuing authority name (income tax dept or CA firm)", "signature or seal"],
    },
  },
  {
    slug: "ties-to-home",
    display_name: "Ties to home country evidence",
    why: "Property papers, family business proof, job offer — anything proving you'll return.",
    phase: 4,
    acceptedFormats: ["pdf", "jpg", "png"],
    aiExpectations: {
      documentDescription: "Any document evidencing ties to the student's home country (property deed, family business registration, conditional job offer, etc.).",
      requiredElements: ["document title or letterhead", "student's name or a clear family link", "issue date within the last 12 months", "official stamp or signature"],
    },
  },
];

export const TOTAL_REQUIRED = CHECKLIST.length;

export function getChecklistItem(slug: string): ChecklistItem | undefined {
  return CHECKLIST.find((c) => c.slug === slug);
}

/** Phases that exist in the checklist (1–4). Phase 5 is post-approval. */
export const PHASES = [1, 2, 3, 4] as const;

export const PHASE_TITLES: Record<number, string> = {
  1: "Before your I-20",
  2: "After I-20 arrival",
  3: "DS-160 and fees",
  4: "Financial evidence",
  5: "Post-approval",
};
