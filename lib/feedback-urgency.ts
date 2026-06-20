import "server-only";
import { getServerSupabase, getSessionUser } from "@/lib/supabase/server";

/**
 * Returns true when the Feedback nav item should show a red urgency dot:
 *   - any document has failed review (latest review per key), OR
 *   - latest readiness snapshot < 60.
 *
 * Best-effort — never throws. False on any failure.
 */
export async function getFeedbackUrgency(): Promise<boolean> {
  try {
    const [sb, user] = await Promise.all([getServerSupabase(), getSessionUser()]);
    if (!sb || !user) return false;

    // Both lookups run in parallel — neither depends on the other.
    const [snapRes, reviewsRes] = await Promise.all([
      sb.from("preparation_snapshots")
        .select("overall_readiness_score")
        .eq("user_id", user.id)
        .order("snapshot_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      sb.from("document_review_results")
        .select("document_key, passed, reviewed_at")
        .eq("user_id", user.id)
        .order("reviewed_at", { ascending: false }),
    ]);
    const snap = snapRes.data;
    const reviews = reviewsRes.data;
    if (typeof snap?.overall_readiness_score === "number"
      && snap.overall_readiness_score < 60) {
      return true;
    }
    const seen = new Set<string>();
    for (const r of reviews ?? []) {
      if (seen.has(r.document_key as string)) continue;
      seen.add(r.document_key as string);
      if (r.passed === false) return true;
    }
    return false;
  } catch {
    return false;
  }
}
