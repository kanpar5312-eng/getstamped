/**
 * Visa country types — mirrors the Supabase `visa_*` tables.
 *
 * The runtime values for US/F-1 are still served from /lib/steps.ts
 * (canonical, hardcoded). These types and helpers exist for non-US
 * countries (UK / CA / AU / DE) which are served from the DB.
 */

export type CountryCode = "US" | "UK" | "CA" | "AU" | "DE";

export type VisaCountry = {
  id: string;
  code: CountryCode;
  name: string;
  visa_type: string;
  flag_emoji: string | null;
  processing_time_weeks: number | null;
  official_portal_url: string | null;
  currency_code: string | null;
  is_active: boolean;
  created_at: string;
};

export type VisaStep = {
  id: string;
  country_code: CountryCode;
  step_number: number;
  phase: number;
  phase_name: string;
  title: string;
  description: string;
  what_to_upload: string | null;
  deadline_offset_days: number | null;
  is_free_tier: boolean;
};

export type VisaDocument = {
  id: string;
  country_code: CountryCode;
  document_key: string;
  display_name: string;
  description: string;
  is_mandatory: boolean;
  ai_review_rules: Record<string, unknown> | null;
  common_mistakes: string[] | null;
  official_source_url: string | null;
};

export type VisaInterviewQuestion = {
  id: string;
  country_code: CountryCode;
  question_text: string;
  category:
    | "study_plan"
    | "finances"
    | "ties_to_home"
    | "university_choice"
    | "post_study_plans"
    | "english_proficiency";
  difficulty: "easy" | "medium" | "hard" | null;
  why_asked: string | null;
  good_answer_signals: string[] | null;
  red_flag_signals: string[] | null;
};

export type UserCountrySelection = {
  id: string;
  user_id: string;
  country_code: CountryCode;
  applying_from_country: string | null;
  selected_at: string;
  visa_appointment_date: string | null;
  university_name: string | null;
};

/**
 * Fallback display data used before the DB call resolves and as the
 * source of truth for the selector grid order. The selector grid is
 * rendered server-side from the DB, but we keep this list so the
 * selector can render its grid skeleton without a network round-trip.
 */
export const SUPPORTED_COUNTRIES: ReadonlyArray<{
  code: CountryCode;
  name: string;
  visa_type: string;
  flag_emoji: string;
  processing_time_weeks: number;
  currency_code: string;
}> = [
  { code: "US", name: "United States",  visa_type: "F-1 Student Visa",            flag_emoji: "🇺🇸", processing_time_weeks: 4,  currency_code: "USD" },
  { code: "UK", name: "United Kingdom", visa_type: "Student Visa (Tier 4)",       flag_emoji: "🇬🇧", processing_time_weeks: 3,  currency_code: "GBP" },
  { code: "CA", name: "Canada",         visa_type: "Study Permit",                flag_emoji: "🇨🇦", processing_time_weeks: 10, currency_code: "CAD" },
  { code: "AU", name: "Australia",      visa_type: "Student Visa (Subclass 500)", flag_emoji: "🇦🇺", processing_time_weeks: 6,  currency_code: "AUD" },
  { code: "DE", name: "Germany",        visa_type: "Student Visa (§16b)",         flag_emoji: "🇩🇪", processing_time_weeks: 8,  currency_code: "EUR" },
];

export function isCountryCode(v: unknown): v is CountryCode {
  return v === "US" || v === "UK" || v === "CA" || v === "AU" || v === "DE";
}

/**
 * Top 30 applicant countries. Used by the CountrySelector's
 * "applying from" dropdown to personalize embassy URLs, TB-test
 * flags, and processing-time hints.
 */
export const APPLICANT_COUNTRIES: ReadonlyArray<{ code: string; name: string }> = [
  { code: "IN", name: "India" },
  { code: "CN", name: "China" },
  { code: "NG", name: "Nigeria" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "KR", name: "South Korea" },
  { code: "VN", name: "Vietnam" },
  { code: "PK", name: "Pakistan" },
  { code: "BD", name: "Bangladesh" },
  { code: "TR", name: "Türkiye" },
  { code: "PH", name: "Philippines" },
  { code: "ID", name: "Indonesia" },
  { code: "TH", name: "Thailand" },
  { code: "NP", name: "Nepal" },
  { code: "LK", name: "Sri Lanka" },
  { code: "TW", name: "Taiwan" },
  { code: "MY", name: "Malaysia" },
  { code: "EG", name: "Egypt" },
  { code: "KE", name: "Kenya" },
  { code: "GH", name: "Ghana" },
  { code: "CO", name: "Colombia" },
  { code: "AR", name: "Argentina" },
  { code: "CL", name: "Chile" },
  { code: "PE", name: "Peru" },
  { code: "ZA", name: "South Africa" },
  { code: "IR", name: "Iran" },
  { code: "RU", name: "Russia" },
  { code: "UA", name: "Ukraine" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "AE", name: "United Arab Emirates" },
];

/** TB-test required (UK) for applicants from these countries. */
// TODO(verify-before-launch: 2026-06-17): TB-listed country set changes.
export const UK_TB_TEST_REQUIRED = new Set([
  "BD", "PK", "NP", "LK", "IN", "VN", "TH", "PH", "ID", "NG", "GH", "KE", "EG", "MY",
]);
