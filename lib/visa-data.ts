import "server-only";

/**
 * Server-only data accessors for the country-aware visa system.
 *
 * F-1 preservation: when the resolved country is "US" (or unknown), every
 * accessor short-circuits and returns the canonical US data from
 * /lib/steps.ts — the legacy F-1 surfaces continue to render unchanged.
 *
 * Use these accessors in dashboard Server Components or API routes that
 * need to surface country-aware playbooks, documents, or interview banks.
 */

import { getServerSupabase } from "@/lib/supabase/server";
import { STEPS, PHASE_META, type Step } from "@/lib/steps";
import {
  isCountryCode,
  type CountryCode,
  type VisaCountry,
  type VisaDocument,
  type VisaInterviewQuestion,
  type VisaStep,
} from "@/lib/visa-countries";

/** Resolve the authenticated user's selected country (null if none/unauth). */
export async function getUserCountry(): Promise<CountryCode | null> {
  const sb = await getServerSupabase();
  if (!sb) return null;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data } = await sb
    .from("user_country_selection")
    .select("country_code")
    .eq("user_id", user.id)
    .maybeSingle();
  return isCountryCode(data?.country_code) ? data!.country_code : null;
}

/** Country metadata for header pill, currency formatting, links. */
export async function getCountryMeta(code: CountryCode): Promise<VisaCountry | null> {
  const sb = await getServerSupabase();
  if (!sb) return null;
  const { data } = await sb
    .from("visa_countries")
    .select("*")
    .eq("code", code)
    .maybeSingle();
  return (data as VisaCountry) ?? null;
}

/**
 * Visa steps for the country. For US the canonical hardcoded list wins.
 * For UK/CA/AU/DE, rows come from visa_steps.
 */
export async function getStepsForCountry(code: CountryCode | null): Promise<VisaStep[]> {
  if (code == null || code === "US") {
    return STEPS.map(usStepToRow);
  }
  const sb = await getServerSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("visa_steps")
    .select("*")
    .eq("country_code", code)
    .order("step_number", { ascending: true });
  return (data as VisaStep[]) ?? [];
}

/** Phase metadata derived from steps. For US, mirrors PHASE_META exactly. */
export async function getPhasesForCountry(code: CountryCode | null) {
  if (code == null || code === "US") return PHASE_META.map((p) => ({ ...p }));
  const steps = await getStepsForCountry(code);
  const seen = new Map<number, { number: number; name: string }>();
  for (const s of steps) {
    if (!seen.has(s.phase)) {
      seen.set(s.phase, { number: s.phase, name: s.phase_name });
    }
  }
  return Array.from(seen.values()).sort((a, b) => a.number - b.number);
}

export async function getDocumentsForCountry(
  code: CountryCode | null,
): Promise<VisaDocument[]> {
  // F-1 docs are owned by the hardcoded checklist (/lib/documents/checklist.ts).
  // For US we intentionally return an empty array — the legacy DocumentsClient
  // keeps using its own source. For other countries, query the table.
  if (code == null || code === "US") return [];
  const sb = await getServerSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("visa_documents")
    .select("*")
    .eq("country_code", code)
    .order("is_mandatory", { ascending: false });
  return (data as VisaDocument[]) ?? [];
}

export async function getInterviewQuestionsForCountry(
  code: CountryCode | null,
  limit = 10,
): Promise<VisaInterviewQuestion[]> {
  // For US the existing mock-interview question bank stays canonical.
  if (code == null || code === "US") return [];
  const sb = await getServerSupabase();
  if (!sb) return [];
  // ORDER BY RANDOM() works on Postgres; Supabase translates this fine.
  const { data } = await sb
    .from("visa_interview_questions")
    .select("*")
    .eq("country_code", code)
    .limit(limit);
  // We randomise client-side to keep this serverless-cache-friendly.
  const rows = (data as VisaInterviewQuestion[]) ?? [];
  for (let i = rows.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rows[i], rows[j]] = [rows[j], rows[i]];
  }
  return rows;
}

/* ---- helpers ---- */

function usStepToRow(s: Step): VisaStep {
  return {
    id: `us-${s.number}`,
    country_code: "US",
    step_number: s.number,
    phase: s.phase,
    phase_name: s.phaseName,
    title: s.title,
    description: s.shortDescription,
    what_to_upload: s.documents[0]?.name ?? null,
    deadline_offset_days: null,
    is_free_tier: s.isFree,
  };
}
