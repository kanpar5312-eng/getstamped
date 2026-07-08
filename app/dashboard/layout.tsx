import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { DashboardWake } from "@/components/dashboard/DashboardWake";
import { DashboardFooter } from "@/components/dashboard/DashboardFooter";
import { CommandPalette } from "@/components/dashboard/CommandPalette";
import { RealtimeRefresher } from "@/components/horizon/RealtimeRefresher";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { getCurrentUser } from "@/lib/current-user";
import { getServerSupabase, getSessionUser } from "@/lib/supabase/server";
import { getFeedbackUrgency } from "@/lib/feedback-urgency";
import { TOS_VERSION } from "@/lib/legal/tos";

function initialsFrom(name: string): string {
  const cleaned = name.trim();
  if (!cleaned) return "GS";
  const parts = cleaned.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return cleaned.slice(0, 2).toUpperCase();
}

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // Fire all three in parallel. They share a memoized session lookup
  // under the hood (lib/supabase/server.ts), so this is effectively one
  // auth round-trip instead of the previous three serial ones.
  const [{ profile }, sessionUser, feedbackUrgent] = await Promise.all([
    getCurrentUser(),
    getSessionUser(),
    getFeedbackUrgency(),
  ]);

  // DPDP Act compliance — forced-scroll ToS gate. A signed-in user who
  // has not affirmed the current TOS_VERSION cannot reach the dashboard;
  // they are redirected back to /sign-up/terms on every entry.
  if (sessionUser) {
    const sb = await getServerSupabase();
    if (sb) {
      const { data: tosRow } = await sb
        .from("profiles")
        .select("tos_consent_version")
        .eq("id", sessionUser.id)
        .maybeSingle();
      if (tosRow?.tos_consent_version !== TOS_VERSION) {
        redirect("/sign-up/terms");
      }
    }
  }

  const initials = initialsFrom(profile.firstName);

  return (
    <div data-surface="dashboard" className="min-h-screen gs-dashboard-shell flex flex-col relative">
      <DashboardWake />
      <DashboardNav initials={initials} email={sessionUser?.email ?? null} plan={profile.plan} userId={sessionUser?.id ?? null} feedbackUrgent={feedbackUrgent} />
      <CommandPalette />
      <RealtimeRefresher
        userId={sessionUser?.id ?? null}
        tables={["step_progress", "step_activity", "documents", "profiles"]}
      />
      <NotificationCenter userId={sessionUser?.id ?? null} />
      <main className="flex-1 mx-auto w-full max-w-[1140px] px-5 sm:px-6 py-8 sm:py-10 lg:py-12 relative z-10">
        {children}
      </main>
      <DashboardFooter />
    </div>
  );
}
