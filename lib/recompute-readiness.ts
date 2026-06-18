import "server-only";
import { getServerSupabase } from "@/lib/supabase/server";

/**
 * Server-side helper that invokes the `compute_readiness` Supabase
 * Edge Function for the currently signed-in user. Best-effort:
 *
 *   - Returns { ok: false } silently on any failure (Edge Function not
 *     deployed yet, network blip, RLS edge case, etc.).
 *   - Never throws — call sites are wrapped in `void` so they can be
 *     fire-and-forget without bringing down the calling write path.
 *
 * Call from anywhere a piece of state changes that could affect
 * readiness: step completion, document review write, mock interview
 * finish. The Edge Function is idempotent (each call inserts a fresh
 * snapshot row), so over-calling is harmless.
 */
export async function recomputeReadiness(): Promise<{ ok: boolean }> {
  try {
    const sb = await getServerSupabase();
    if (!sb) return { ok: false };
    const { error } = await sb.functions.invoke("compute_readiness");
    if (error) {
      // Until the Edge Function is deployed this path is normal; log
      // once for visibility but don't surface to callers.
      console.warn("[recomputeReadiness] edge function not available:", error.message);
      return { ok: false };
    }
    return { ok: true };
  } catch (e) {
    console.warn("[recomputeReadiness] threw:", e);
    return { ok: false };
  }
}
