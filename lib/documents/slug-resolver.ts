import "server-only";
import { CHECKLIST } from "@/lib/documents/checklist";

/* ════════════════════════════════════════════════════════════════════════
   resolveDocumentSlug — best-effort match from a Timeline step's
   free-text document name (e.g. "SEVIS I-901 receipt (PDF)") to one of
   the 14 canonical CHECKLIST slugs used by the real Document Vault.

   Why a resolver instead of editing every step's content: the 47-step
   Playbook repeats document mentions across 10+ steps in loosely
   worded ways ("Bank statements (6 months)", "Original signed I-20",
   "Verified I-20", ...). Adding an explicit slug to every matching
   line across lib/step-content.ts and lib/step-content-extended.ts
   would mean hand-editing dozens of lines with real risk of typos in
   unrelated copy. A keyword resolver gets the same result — Timeline
   items that clearly correspond to a real document surface live
   Document Vault status — without touching the 47-step content files
   at all.

   Deliberately conservative: returns null (no live-status treatment,
   old decorative behaviour untouched) rather than a wrong guess.
   ════════════════════════════════════════════════════════════════════════ */

type Rule = { slug: string; test: (nameLower: string) => boolean };

const RULES: Rule[] = [
  { slug: "passport-bio", test: (n) => n.includes("passport") },
  { slug: "i20", test: (n) => n.includes("i-20") || n.includes("i20") },
  { slug: "sevis-receipt", test: (n) => n.includes("sevis") || n.includes("i-901") },
  {
    slug: "ds160-confirmation",
    test: (n) => n.includes("ds-160") || n.includes("ds160"),
  },
  {
    slug: "visa-fee-receipt",
    test: (n) => n.includes("mrv") || (n.includes("visa") && n.includes("fee")),
  },
  {
    slug: "us-visa-photo",
    test: (n) => n.includes("visa photo") || n.includes("photo (digital"),
  },
  {
    slug: "bank-statement",
    test: (n) => n.includes("bank statement"),
  },
  {
    slug: "loan-or-scholarship",
    test: (n) => n.includes("loan sanction") || n.includes("scholarship"),
  },
  {
    slug: "sponsor-docs",
    test: (n) =>
      n.includes("affidavit of support") ||
      n.includes("sponsor's salary") ||
      n.includes("sponsor cover letter") ||
      n.includes("income proof"),
  },
  {
    slug: "admission-letter",
    test: (n) => n.includes("admission") || n.includes("acceptance letter"),
  },
  {
    slug: "marksheet-10",
    test: (n) => n.includes("10th") && (n.includes("transcript") || n.includes("marksheet") || n.includes("grade")),
  },
  {
    slug: "marksheet-12",
    test: (n) => n.includes("12th") && (n.includes("transcript") || n.includes("marksheet") || n.includes("grade")),
  },
  {
    slug: "degree-transcript",
    test: (n) => n.includes("undergraduate transcript") || n.includes("degree transcript") || n.includes("university transcript"),
  },
  {
    slug: "ties-to-home",
    test: (n) => n.includes("ties to home") || n.includes("property") || n.includes("family business"),
  },
];

export function resolveDocumentSlug(name: string): string | null {
  const n = name.toLowerCase();
  for (const rule of RULES) {
    if (rule.test(n)) return rule.slug;
  }
  return null;
}

/** Convenience — resolves + confirms the slug still exists in the live
 *  checklist (defensive against the checklist changing later). */
export function resolveDocumentSlugStrict(name: string): string | null {
  const slug = resolveDocumentSlug(name);
  if (!slug) return null;
  return CHECKLIST.some((c) => c.slug === slug) ? slug : null;
}
