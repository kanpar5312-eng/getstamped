import type { ReactNode } from "react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { CountryPill } from "@/components/dashboard/CountryPill";
import { DashboardWake } from "@/components/dashboard/DashboardWake";
import { DashboardFooter } from "@/components/dashboard/DashboardFooter";
import { CommandPalette } from "@/components/dashboard/CommandPalette";
import { RealtimeRefresher } from "@/components/horizon/RealtimeRefresher";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { getCurrentUser } from "@/lib/current-user";
import { getSessionUser } from "@/lib/supabase/server";
import { getFeedbackUrgency } from "@/lib/feedback-urgency";

function initialsFrom(name: string): string {
  const cleaned = name.trim();
  if (!cleaned) return "GS";
  const parts = cleaned.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return cleaned.slice(0, 2).toUpperCase();
}

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { profile } = await getCurrentUser();
  const sessionUser = await getSessionUser();
  const initials = initialsFrom(profile.firstName);
  const feedbackUrgent = await getFeedbackUrgency();

  return (
    <div data-surface="dashboard" className="min-h-screen flex flex-col relative">
      <DashboardWake />
      <DashboardNav initials={initials} email={sessionUser?.email ?? null} plan={profile.plan} userId={sessionUser?.id ?? null} feedbackUrgent={feedbackUrgent} />
      <CommandPalette />
      <RealtimeRefresher
        userId={sessionUser?.id ?? null}
        tables={["step_progress", "step_activity", "documents", "profiles"]}
      />
      <NotificationCenter userId={sessionUser?.id ?? null} />
      <main className="flex-1 mx-auto w-full max-w-[1140px] px-5 sm:px-6 py-8 sm:py-10 lg:py-12 relative z-10">
        <div className="mb-4 flex justify-end">
          <CountryPill authed={Boolean(sessionUser?.id)} />
        </div>
        {children}
      </main>
      <DashboardFooter />
    </div>
  );
}
