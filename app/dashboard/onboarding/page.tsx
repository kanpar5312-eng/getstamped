import { redirect } from "next/navigation";

// The real onboarding lives at /onboarding (full-screen, no dashboard chrome).
export default function DashboardOnboardingRedirect(): never {
  redirect("/onboarding");
}
