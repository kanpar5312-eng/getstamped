import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/current-user";
import { getOrCreateParentToken } from "@/app/actions/parent-view";
import { getTokenForUser } from "@/lib/parent-view";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSessionUser } from "@/lib/supabase/server";
import { ParentViewClient } from "@/components/parent-view/ParentViewClient";
import { PaywallOverlay } from "@/components/paywall/PaywallOverlay";
import { PHASES, TOTAL_STEPS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Parent View — GetStamped",
};

type SearchParams = Promise<{ state?: string }>;

export default async function ParentViewPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const { profile, progress } = await getCurrentUser(sp.state);

  // Free tier doesn't get parent share. Block at the page level so we
  // never mint a token or expose the page chrome.
  if (profile.plan === "free") {
    return (
      <div className="mx-auto max-w-2xl py-20 px-4">
        <PaywallOverlay type="upgrade" feature="Parent share" />
      </div>
    );
  }

  const isReal = isSupabaseConfigured() && Boolean(await getSessionUser());
  const real = isReal ? await getOrCreateParentToken() : null;
  const t = real ?? getTokenForUser();

  // Real progress snapshot for the "See what they see" preview block.
  const completedSteps = progress.filter((p) => p.status === "complete").length;
  // Current phase = the phase containing the lowest non-complete step, or
  // the final phase if everything is done.
  const phaseStart: { phase: number; cumulative: number }[] = [];
  let acc = 0;
  PHASES.forEach((p, i) => {
    phaseStart.push({ phase: i + 1, cumulative: acc });
    acc += p.steps.length;
  });
  let currentPhaseNumber = 1;
  let currentPhaseName = PHASES[0].name;
  for (let i = PHASES.length - 1; i >= 0; i -= 1) {
    if (completedSteps >= phaseStart[i].cumulative) {
      // If the phase is fully complete and another exists, lean into the next.
      const fullyDone =
        completedSteps >= phaseStart[i].cumulative + PHASES[i].steps.length;
      const idx = fullyDone && i < PHASES.length - 1 ? i + 1 : i;
      currentPhaseNumber = idx + 1;
      currentPhaseName = PHASES[idx].name;
      break;
    }
  }

  return (
    <ParentViewClient
      initialEnabled={t.enabled}
      initialToken={t.token}
      views={"views" in t ? t.views : 0}
      lastViewedAt={"lastViewedAt" in t ? t.lastViewedAt : null}
      plan={profile.plan}
      isReal={isReal}
      studentName={profile.firstName}
      completedSteps={completedSteps}
      totalSteps={TOTAL_STEPS}
      currentPhaseNumber={currentPhaseNumber}
      currentPhaseName={currentPhaseName}
    />
  );
}
