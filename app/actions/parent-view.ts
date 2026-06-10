"use server";

import { revalidatePath } from "next/cache";
import { getServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { sendMail } from "@/lib/email";
import { buildParentInvite } from "@/lib/email-templates";

export type ParentTokenRow = {
  token: string;
  enabled: boolean;
  views: number;
  lastViewedAt: Date | null;
};

function randomToken(): string {
  // 12 chars base36, unguessable enough for share links
  const a = Math.random().toString(36).slice(2);
  const b = Math.random().toString(36).slice(2);
  return (a + b).slice(0, 12);
}

async function requireUser() {
  if (!isSupabaseConfigured()) return { ok: false as const };
  const sb = await getServerSupabase();
  if (!sb) return { ok: false as const };
  const { data } = await sb.auth.getUser();
  if (!data.user) return { ok: false as const };
  return { ok: true as const, sb, userId: data.user.id };
}

/**
 * Fetches the current user's parent share token; creates one if missing.
 */
export async function getOrCreateParentToken(): Promise<ParentTokenRow | null> {
  const u = await requireUser();
  if (!u.ok) return null;

  const { data: existing } = await u.sb
    .from("parent_view_tokens")
    .select("token, enabled, views, last_viewed_at")
    .eq("user_id", u.userId)
    .maybeSingle();

  if (existing) {
    return {
      token: existing.token,
      enabled: existing.enabled,
      views: existing.views ?? 0,
      lastViewedAt: existing.last_viewed_at ? new Date(existing.last_viewed_at) : null,
    };
  }

  const token = randomToken();
  const { data: created, error } = await u.sb
    .from("parent_view_tokens")
    .insert({ user_id: u.userId, token, enabled: true })
    .select("token, enabled, views, last_viewed_at")
    .single();
  if (error || !created) return null;
  return {
    token: created.token,
    enabled: created.enabled,
    views: created.views ?? 0,
    lastViewedAt: created.last_viewed_at ? new Date(created.last_viewed_at) : null,
  };
}

export async function setParentTokenEnabled(enabled: boolean): Promise<{ ok: boolean; error?: string }> {
  const u = await requireUser();
  if (!u.ok) return { ok: false, error: "Not signed in." };
  const { error } = await u.sb
    .from("parent_view_tokens")
    .update({ enabled })
    .eq("user_id", u.userId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/parent-view");
  return { ok: true };
}

export async function sendParentInvite(
  toEmail: string,
  parentName?: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!toEmail || !/.+@.+\..+/.test(toEmail)) {
    return { ok: false, error: "Enter a valid email." };
  }
  const u = await requireUser();
  if (!u.ok) return { ok: false, error: "Not signed in." };

  const [{ data: profile }, { data: token }] = await Promise.all([
    u.sb.from("profiles").select("first_name").eq("id", u.userId).maybeSingle(),
    u.sb.from("parent_view_tokens").select("token, enabled").eq("user_id", u.userId).maybeSingle(),
  ]);
  if (!token || !token.enabled) return { ok: false, error: "Share link is disabled. Enable it before inviting." };

  const origin = process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "https://getstamped.app";
  const shareUrl = `${origin}/parent/${token.token}`;
  const { subject, text, html } = buildParentInvite({
    studentFirstName: profile?.first_name ?? "Student",
    parentName,
    shareUrl,
  });
  const res = await sendMail({ to: toEmail, subject, text, html });
  if (!res.ok) return { ok: false, error: res.error };
  return { ok: true };
}

export async function regenerateParentToken(): Promise<{ ok: boolean; token?: string; error?: string }> {
  const u = await requireUser();
  if (!u.ok) return { ok: false, error: "Not signed in." };
  const token = randomToken();
  const { error } = await u.sb
    .from("parent_view_tokens")
    .update({ token, views: 0, last_viewed_at: null })
    .eq("user_id", u.userId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/parent-view");
  return { ok: true, token };
}
