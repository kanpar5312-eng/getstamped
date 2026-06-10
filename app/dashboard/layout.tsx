import type { ReactNode } from "react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { CommandPalette } from "@/components/dashboard/CommandPalette";
import { RealtimeRefresher } from "@/components/horizon/RealtimeRefresher";
import { getCurrentUser } from "@/lib/current-user";
import { getSessionUser } from "@/lib/supabase/server";

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

  return (
    <div data-surface="dashboard" className="min-h-screen flex flex-col relative">
      <DashboardNav initials={initials} email={sessionUser?.email ?? null} plan={profile.plan} />
      <CommandPalette />
      <RealtimeRefresher
        userId={sessionUser?.id ?? null}
        tables={["step_progress", "step_activity", "documents", "profiles"]}
      />
      <main className="flex-1 mx-auto w-full max-w-[1200px] px-5 sm:px-8 py-8 sm:py-10 lg:py-12 relative z-10">
        {children}
      </main>
    </div>
  );
}
