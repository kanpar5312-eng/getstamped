/**
 * Origin-country axis (where the applicant is FROM), distinct from the
 * destination `CountryCode` in lib/visa-countries.ts (where they're
 * STUDYING — US/UK/CA/AU/DE). "CA_ORIGIN" avoids colliding with that
 * system's "CA" (Canada as a study destination).
 */

export type HomeCountryCode =
  | "IN"
  | "CN"
  | "KR"
  | "CA_ORIGIN"
  | "TW"
  | "VN"
  | "NG"
  | "NP"
  | "BD"
  | "BR";

export const HOME_COUNTRY_NAME_TO_CODE: Record<string, HomeCountryCode | undefined> = {
  india: "IN",
  china: "CN",
  vietnam: "VN",
  "south korea": "KR",
  nigeria: "NG",
  brazil: "BR",
  bangladesh: "BD",
  nepal: "NP",
  taiwan: "TW",
  canada: "CA_ORIGIN",
  // No home-country-content code yet (still map to the destination-country
  // curtain feature's ISO2 where applicable, but no playbook overrides):
  mexico: undefined,
  pakistan: undefined,
  indonesia: undefined,
  japan: undefined,
  colombia: undefined,
  ghana: undefined,
  kenya: undefined,
  philippines: undefined,
  turkey: undefined,
  "saudi arabia": undefined,
};

export function homeCodeFromCountryName(name: string | null | undefined): HomeCountryCode | null {
  if (!name) return null;
  return HOME_COUNTRY_NAME_TO_CODE[name.trim().toLowerCase()] ?? null;
}

/** Countries with real (non-universal) playbook content today. */
export const COUNTRIES_WITH_OVERRIDES: HomeCountryCode[] = ["IN"];

/** Every origin country this task scaffolds for, in requirement order. */
export const ALL_HOME_COUNTRIES: HomeCountryCode[] = [
  "IN",
  "CN",
  "KR",
  "CA_ORIGIN",
  "TW",
  "VN",
  "NG",
  "NP",
  "BD",
  "BR",
];

export const HOME_COUNTRY_LABEL: Record<HomeCountryCode, string> = {
  IN: "India",
  CN: "China",
  KR: "South Korea",
  CA_ORIGIN: "Canada",
  TW: "Taiwan",
  VN: "Vietnam",
  NG: "Nigeria",
  NP: "Nepal",
  BD: "Bangladesh",
  BR: "Brazil",
};
