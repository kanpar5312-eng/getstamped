"use server";

import { getServerSupabase, getSessionUser } from "@/lib/supabase/server";

export type PromoResult =
  | { ok: true; plan: "solo" | "family"; message: string }
  | { ok: false; error: string };

/**
 * Validates + redeems a promo code for the current user.
 * The redeem_promo_code SQL function does the atomic decrement so two
 * users can't both claim the last slot. On success we set the
 * profile.plan to the override and return the new plan.
 */
export async function applyPromoCode(rawCode: string): Promise<PromoResult> {
  const code = (rawCode ?? "").trim();
  if (!code) return { ok: false, error: "Enter a code." };

  const user = await getSessionUser();
  if (!user) {
    return { ok: false, error: "Please sign in before applying a code." };
  }
  const sb = await getServerSupabase();
  if (!sb) return { ok: false, error: "Backend unavailable. Try again." };

  // Atomic: returns plan_override or null.
  const { data: plan, error } = await sb.rpc("redeem_promo_code", {
    p_code: code,
  });
  if (error) {
    console.error("[applyPromoCode] rpc error:", error);
    return { ok: false, error: "Couldn't validate the code. Try again." };
  }
  if (!plan) {
    return { ok: false, error: "Invalid or expired code." };
  }

  const newPlan = plan === "family" ? "family" : "solo";
  const { error: profErr } = await sb
    .from("profiles")
    .update({ plan: newPlan })
    .eq("id", user.id);
  if (profErr) {
    // Profile failed to update — best-effort: tell the user, but the
    // code has already been redeemed atomically. Manual intervention.
    console.error("[applyPromoCode] profile update failed:", profErr);
    return { ok: false, error: "Code accepted but plan update failed. Contact support." };
  }

  return {
    ok: true,
    plan: newPlan,
    message: "Code applied — Full access unlocked",
  };
}
