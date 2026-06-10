"use server";

import { createClient } from "@supabase/supabase-js";
import { hasSupabase } from "@/lib/supabase";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/config";
import { sendMail } from "@/lib/email";
import { buildWelcomeEmail } from "@/lib/email-templates";

export type WaitlistResult =
  | { ok: true; position: number; isEarlyBird: boolean }
  | { ok: false; error: string };

/**
 * Waitlist signup — anon key insert (waitlist_insert_public policy permits it).
 *
 *   1. Validates email
 *   2. Inserts into `waitlist` (position auto-increments, trigger sets early-bird)
 *   3. Fires Resend welcome email (best-effort; never blocks success)
 *   4. Returns { position, isEarlyBird }
 *
 * Stub mode: when Supabase isn't configured, returns a deterministic mock
 * position so dev UI continues to demo.
 */
export async function joinWaitlist(email: string): Promise<WaitlistResult> {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  if (!hasSupabase()) {
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) hash = (hash * 31 + normalized.charCodeAt(i)) >>> 0;
    const position = (hash % 73) + 28;
    return { ok: true, position, isEarlyBird: position <= 100 };
  }

  const sb = createClient(getSupabaseUrl()!, getSupabaseAnonKey()!, {
    auth: { persistSession: false },
  });

  const { data, error } = await sb
    .from("waitlist")
    .insert({ email: normalized })
    .select("position, is_early_bird")
    .single();

  if (error) {
    if (error.code === "23505") {
      // already on list — surface the existing position quietly
      const { data: existing } = await sb
        .from("waitlist")
        .select("position, is_early_bird")
        .eq("email", normalized)
        .maybeSingle();
      if (existing) {
        return {
          ok: true,
          position: existing.position,
          isEarlyBird: Boolean(existing.is_early_bird),
        };
      }
    }
    return { ok: false, error: error.message };
  }

  // Best-effort send. Don't block on email failure.
  const { subject, text, html } = buildWelcomeEmail({
    position: data.position,
    isEarlyBird: Boolean(data.is_early_bird),
  });
  void sendMail({ to: normalized, subject, text, html, from: "personal" });

  return {
    ok: true,
    position: data.position,
    isEarlyBird: Boolean(data.is_early_bird),
  };
}

/**
 * Live waitlist counter, used by the hero. Reads the aggregate view, which is
 * granted to anon by the schema.
 */
export async function getWaitlistCount(): Promise<{
  totalSignups: number;
  earlyBirdClaimed: number;
}> {
  if (!hasSupabase()) {
    // No Supabase configured — return zeros so the UI can hide the chip
    // rather than display a fabricated number.
    return { totalSignups: 0, earlyBirdClaimed: 0 };
  }
  const sb = createClient(getSupabaseUrl()!, getSupabaseAnonKey()!, {
    auth: { persistSession: false },
  });
  const { data, error } = await sb
    .from("waitlist_counts")
    .select("total_signups, early_bird_claimed")
    .single();
  if (error || !data) return { totalSignups: 0, earlyBirdClaimed: 0 };
  return {
    totalSignups: data.total_signups ?? 0,
    earlyBirdClaimed: data.early_bird_claimed ?? 0,
  };
}
