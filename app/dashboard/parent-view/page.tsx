import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/current-user";
import { getOrCreateParentToken } from "@/app/actions/parent-view";
import { getTokenForUser } from "@/lib/parent-view";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSessionUser } from "@/lib/supabase/server";
import { ParentViewClient } from "@/components/parent-view/ParentViewClient";

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
  const { profile } = await getCurrentUser(sp.state);

  const isReal = isSupabaseConfigured() && Boolean(await getSessionUser());
  const real = isReal ? await getOrCreateParentToken() : null;
  const t = real ?? getTokenForUser();

  return (
    <ParentViewClient
      initialEnabled={t.enabled}
      initialToken={t.token}
      views={"views" in t ? t.views : 0}
      lastViewedAt={"lastViewedAt" in t ? t.lastViewedAt : null}
      plan={profile.plan}
      isReal={isReal}
    />
  );
}
