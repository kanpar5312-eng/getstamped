/**
 * Mock document inventory — drives the Documents page during development.
 * Replaced by Supabase Storage listings once wired.
 */

export type MockDoc = {
  id: string;
  name: string;
  filename: string;
  step: number;
  phase: number;
  sizeKb: number;
  uploadedAt: Date | null;
  expiresAt: Date | null;
  required: boolean;
  type: "pdf" | "image" | "doc";
};

const NOW = new Date("2026-06-06T12:00:00Z");
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86_400_000);
const daysAhead = (n: number) => new Date(NOW.getTime() + n * 86_400_000);

export const MOCK_DOCS: MockDoc[] = [
  // Phase 1
  { id: "d1", name: "Common App admit letter", filename: "ncsu-admit.pdf", step: 5, phase: 1, sizeKb: 412, uploadedAt: daysAgo(34), expiresAt: null, required: true, type: "pdf" },
  { id: "d2", name: "Enrollment deposit receipt", filename: "deposit-receipt.pdf", step: 5, phase: 1, sizeKb: 88, uploadedAt: daysAgo(31), expiresAt: null, required: true, type: "pdf" },
  { id: "d3", name: "I-20 (signed)", filename: "i20-signed.pdf", step: 6, phase: 1, sizeKb: 720, uploadedAt: daysAgo(28), expiresAt: null, required: true, type: "pdf" },

  // Phase 2
  { id: "d4", name: "SEVIS payment receipt", filename: "sevis-receipt.pdf", step: 9, phase: 2, sizeKb: 142, uploadedAt: daysAgo(22), expiresAt: null, required: true, type: "pdf" },
  { id: "d5", name: "Passport scan", filename: "passport-aps.pdf", step: 10, phase: 2, sizeKb: 845, uploadedAt: daysAgo(20), expiresAt: daysAhead(180), required: true, type: "pdf" },
  { id: "d6", name: "Bank statement (6 months)", filename: "bank-statements-jan-jun.pdf", step: 11, phase: 2, sizeKb: 2100, uploadedAt: daysAgo(18), expiresAt: daysAhead(60), required: true, type: "pdf" },
  { id: "d7", name: "Sponsor affidavit", filename: "affidavit-of-support.pdf", step: 11, phase: 2, sizeKb: 380, uploadedAt: daysAgo(18), expiresAt: null, required: true, type: "pdf" },
  { id: "d8", name: "Academic transcripts", filename: "transcripts-12th-undergrad.pdf", step: 12, phase: 2, sizeKb: 1450, uploadedAt: daysAgo(16), expiresAt: null, required: true, type: "pdf" },
  { id: "d9", name: "TOEFL scorecard", filename: "toefl-scorecard.pdf", step: 12, phase: 2, sizeKb: 220, uploadedAt: daysAgo(14), expiresAt: daysAhead(20), required: true, type: "pdf" },
  { id: "d10", name: "Property documents (ties)", filename: "family-property.pdf", step: 13, phase: 2, sizeKb: 1100, uploadedAt: daysAgo(11), expiresAt: null, required: true, type: "pdf" },
  { id: "d11", name: "Passport photo (2×2)", filename: "passport-photo.jpg", step: 14, phase: 2, sizeKb: 240, uploadedAt: daysAgo(8), expiresAt: null, required: true, type: "image" },

  // Phase 3
  { id: "d12", name: "DS-160 confirmation page", filename: "ds160-confirmation.pdf", step: 22, phase: 3, sizeKb: 110, uploadedAt: daysAgo(4), expiresAt: null, required: true, type: "pdf" },
  { id: "d13", name: "MRV fee receipt", filename: "mrv-receipt.pdf", step: 24, phase: 3, sizeKb: 74, uploadedAt: daysAgo(3), expiresAt: null, required: true, type: "pdf" },
];

// Missing-from-required ledger (drives "Suggested documents" + missing count)
export const MOCK_MISSING_DOCS: { name: string; description: string; step: number; phase: number }[] = [
  { name: "I-94 record", description: "Print after first US arrival.", step: 46, phase: 5, required: false } as never,
];

export const STORAGE_USED_KB = MOCK_DOCS.reduce((n, d) => n + d.sizeKb, 0);
