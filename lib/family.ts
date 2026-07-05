import "server-only";
import { cookies } from "next/headers";
import { getAdminSupabase } from "@/lib/documents/admin";
import { getServerSupabase, getSessionUser } from "@/lib/supabase/server";
import { sendMail } from "@/lib/email";
import { renderFamilyInviteEmail } from "@/lib/email-templates/family-invite";

/* ════════════════════════════════════════════════════════════════════════
   Family plan — real multi-seat support.

   Mirrors lib/referrals.ts's shape: a code/token-based invite, a cookie
   that survives the sign-up detour for a not-yet-registered invitee, and
   an atomic accept (here a SECURITY DEFINER SQL function instead of a
   plain UPDATE, since accepting also has to touch profiles).

   See supabase/migrations/0011_family_seats.sql for the schema + the
   accept_family_invite() function this module calls into.
   ════════════════════════════════════════════════════════════════════════ */

export const FAMILY_INVITE_COOKIE = "gs_family_invite";
export const FAMILY_INVITE_COOKIE_MAX_AGE = 60 * 60 * 24 * 14; // 14 days

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // Crockford base32, no look-alikes

function randomToken(len = 24): string {
  let out = "";
  const buf = new Uint8Array(len);
  crypto.getRandomValues(buf);
  for (let i = 0; i < len; i++) out += ALPHABET[buf[i]! % ALPHABET.length];
  return out;
}

export type FamilySeat = {
  userId: string;
  firstName: string | null;
  isOwner: boolean;
};

export type FamilyState =
  | { role: "none" }
  | {
      role: "owner" | "member";
      groupId: string;
      maxSeats: number;
      ownerFirstName: string | null;
      seats: FamilySeat[];
      pendingInvites: { id: string; email: string; createdAt: string }[];
    };

/**
 * Full family-group picture for the current user's Settings page:
 * who's in the group, who's still pending, and whether the caller is
 * the owner (can invite/remove) or a member (can only leave).
 */
export async function getFamilyState(userId: string): Promise<FamilyState> {
  const admin = getAdminSupabase();
  if (!admin) return { role: "none" };

  const { data: profile } = await admin
    .from("profiles")
    .select("family_group_id")
    .eq("id", userId)
    .maybeSingle();

  let groupId = profile?.family_group_id as string | null | undefined;

  // Not linked to a group yet — only relevant if they're the owner of one
  // they haven't invited anyone into (group is created lazily on first
  // invite), in which case there's simply nothing to show yet.
  if (!groupId) {
    const { data: ownedGroup } = await admin
      .from("family_groups")
      .select("id")
      .eq("owner_user_id", userId)
      .maybeSingle();
    if (!ownedGroup) return { role: "none" };
    groupId = ownedGroup.id;
  }

  if (!groupId) return { role: "none" };
  const resolvedGroupId: string = groupId;

  const { data: group } = await admin
    .from("family_groups")
    .select("id, owner_user_id, max_seats")
    .eq("id", resolvedGroupId)
    .maybeSingle();
  if (!group) return { role: "none" };

  const [{ data: memberRows }, { data: ownerRow }, { data: pendingRows }] = await Promise.all([
    admin.from("profiles").select("id, first_name").eq("family_group_id", resolvedGroupId),
    admin.from("profiles").select("first_name").eq("id", group.owner_user_id).maybeSingle(),
    admin
      .from("family_invites")
      .select("id, email, created_at")
      .eq("family_group_id", resolvedGroupId)
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
  ]);

  const seats: FamilySeat[] = (memberRows ?? []).map((m: { id: string; first_name: string | null }) => ({
    userId: m.id,
    firstName: m.first_name,
    isOwner: m.id === group.owner_user_id,
  }));

  return {
    role: userId === group.owner_user_id ? "owner" : "member",
    groupId: resolvedGroupId,
    maxSeats: group.max_seats,
    ownerFirstName: ownerRow?.first_name ?? null,
    seats,
    pendingInvites: (pendingRows ?? []).map((r: { id: string; email: string; created_at: string }) => ({
      id: r.id,
      email: r.email,
      createdAt: r.created_at,
    })),
  };
}

export type InviteResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Owner-only: invite someone by email. Creates the family_groups row on
 * first use (lazy — most Family purchasers may never invite anyone).
 */
export async function inviteFamilyMember(email: string): Promise<InviteResult> {
  const clean = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
    return { ok: false, error: "Enter a valid email." };
  }

  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const admin = getAdminSupabase();
  if (!admin) return { ok: false, error: "Backend unavailable. Try again." };

  const { data: profile } = await admin
    .from("profiles")
    .select("plan, first_name, family_group_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.plan !== "family") {
    return { ok: false, error: "Only the Family plan supports adding a second student." };
  }

  // A member (not the owner) can't invite on someone else's behalf.
  if (profile.family_group_id) {
    const { data: existingGroup } = await admin
      .from("family_groups")
      .select("owner_user_id")
      .eq("id", profile.family_group_id)
      .maybeSingle();
    if (existingGroup && existingGroup.owner_user_id !== user.id) {
      return { ok: false, error: "Only the plan owner can send invites." };
    }
  }

  // Lazily create the group on first invite.
  let groupId = profile.family_group_id as string | null;
  let maxSeats = 2;
  if (!groupId) {
    const { data: newGroup, error: groupErr } = await admin
      .from("family_groups")
      .insert({ owner_user_id: user.id })
      .select("id, max_seats")
      .single();
    if (groupErr || !newGroup) {
      // Might already exist from a prior invite that got orphaned before
      // the profile row was updated — fetch instead of failing outright.
      const { data: existing } = await admin
        .from("family_groups")
        .select("id, max_seats")
        .eq("owner_user_id", user.id)
        .maybeSingle();
      if (!existing) return { ok: false, error: "Couldn't set up your family group. Try again." };
      groupId = existing.id;
      maxSeats = existing.max_seats;
    } else {
      groupId = newGroup.id;
      maxSeats = newGroup.max_seats;
      await admin.from("profiles").update({ family_group_id: groupId }).eq("id", user.id);
    }
  } else {
    const { data: g } = await admin.from("family_groups").select("max_seats").eq("id", groupId).maybeSingle();
    if (g) maxSeats = g.max_seats;
  }

  // Capacity check — count filled seats + still-pending invites.
  const [{ count: seatCount }, { count: pendingCount }, { data: dupe }] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }).eq("family_group_id", groupId),
    admin
      .from("family_invites")
      .select("id", { count: "exact", head: true })
      .eq("family_group_id", groupId)
      .eq("status", "pending"),
    admin
      .from("family_invites")
      .select("id")
      .eq("family_group_id", groupId)
      .eq("status", "pending")
      .eq("email", clean)
      .maybeSingle(),
  ]);
  if (dupe) {
    return { ok: false, error: "There's already a pending invite for that email." };
  }
  if ((seatCount ?? 0) + (pendingCount ?? 0) >= maxSeats) {
    return { ok: false, error: `Your Family plan only has ${maxSeats} seats.` };
  }

  const token = randomToken();
  const { error: inviteErr } = await admin.from("family_invites").insert({
    family_group_id: groupId,
    email: clean,
    token,
  });
  if (inviteErr) {
    console.error("[family] invite insert failed:", inviteErr);
    return { ok: false, error: "Couldn't create the invite. Try again." };
  }

  const origin = process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "https://getstamped.app";
  const tmpl = renderFamilyInviteEmail({
    ownerFirstName: profile.first_name ?? "",
    joinUrl: `${origin}/family/join/${token}`,
  });
  const sent = await sendMail({ to: clean, subject: tmpl.subject, html: tmpl.html, text: tmpl.text });
  if (!sent.ok) {
    // The invite row exists either way — the link still works if the
    // owner copies the join URL manually. Log this loudly since a
    // "successful" invite the recipient never received looks silent.
    console.error("[family] invite email failed to send:", sent.error);
  }

  return { ok: true };
}

/** Owner-only: cancel a pending invite before it's accepted. */
export async function revokeFamilyInvite(inviteId: string): Promise<InviteResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Please sign in first." };
  const admin = getAdminSupabase();
  if (!admin) return { ok: false, error: "Backend unavailable. Try again." };

  const { data: invite } = await admin
    .from("family_invites")
    .select("family_group_id")
    .eq("id", inviteId)
    .maybeSingle();
  if (!invite) return { ok: false, error: "Invite not found." };

  const { data: group } = await admin
    .from("family_groups")
    .select("owner_user_id")
    .eq("id", invite.family_group_id)
    .maybeSingle();
  if (!group || group.owner_user_id !== user.id) {
    return { ok: false, error: "Only the plan owner can manage invites." };
  }

  const { error } = await admin.from("family_invites").update({ status: "revoked" }).eq("id", inviteId);
  if (error) return { ok: false, error: "Couldn't revoke the invite." };
  return { ok: true };
}

/** Owner-only: remove an accepted member — reverts them to the free plan. */
export async function removeFamilyMember(memberUserId: string): Promise<InviteResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Please sign in first." };
  if (memberUserId === user.id) return { ok: false, error: "Use \"Leave family plan\" for your own seat." };

  const admin = getAdminSupabase();
  if (!admin) return { ok: false, error: "Backend unavailable. Try again." };

  const { data: member } = await admin
    .from("profiles")
    .select("family_group_id")
    .eq("id", memberUserId)
    .maybeSingle();
  if (!member?.family_group_id) return { ok: false, error: "That person isn't on your family plan." };

  const { data: group } = await admin
    .from("family_groups")
    .select("owner_user_id")
    .eq("id", member.family_group_id)
    .maybeSingle();
  if (!group || group.owner_user_id !== user.id) {
    return { ok: false, error: "Only the plan owner can remove a member." };
  }

  const { error } = await admin
    .from("profiles")
    .update({ family_group_id: null, plan: "free" })
    .eq("id", memberUserId);
  if (error) return { ok: false, error: "Couldn't remove that member." };
  return { ok: true };
}

/** Member-only: leave the family plan — reverts to the free plan. */
export async function leaveFamilyGroup(): Promise<InviteResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  // family_groups is locked down (revoke all from anon, authenticated —
  // see the migration), so this has to go through the admin client like
  // every other family_* read here. Using the plain session client would
  // silently return null for the owner-check below and fail OPEN,
  // letting the owner "leave" their own plan.
  const admin = getAdminSupabase();
  if (!admin) return { ok: false, error: "Backend unavailable. Try again." };

  const { data: profile } = await admin.from("profiles").select("family_group_id").eq("id", user.id).maybeSingle();
  if (!profile?.family_group_id) return { ok: false, error: "You're not on a family plan." };

  const { data: group } = await admin
    .from("family_groups")
    .select("owner_user_id")
    .eq("id", profile.family_group_id)
    .maybeSingle();
  if (group?.owner_user_id === user.id) {
    return { ok: false, error: "The plan owner can't leave — remove members instead, or contact support." };
  }

  const { error } = await admin.from("profiles").update({ family_group_id: null, plan: "free" }).eq("id", user.id);
  if (error) return { ok: false, error: "Couldn't leave the family plan." };
  return { ok: true };
}

/** Already-signed-in user clicking a /family/join/<token> link. */
export async function joinFamilyByToken(token: string): Promise<InviteResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const sb = await getServerSupabase();
  if (!sb) return { ok: false, error: "Backend unavailable. Try again." };

  const { data: groupId, error } = await sb.rpc("accept_family_invite", {
    p_token: token,
    p_user_id: user.id,
  });
  if (error) {
    console.error("[family] accept rpc error:", error);
    return { ok: false, error: "Couldn't accept the invite. Try again." };
  }
  if (!groupId) return { ok: false, error: "This invite is invalid, already used, or the plan is full." };
  return { ok: true };
}

/**
 * Brand-new signup: reads the cookie /family/join/<token> set before the
 * sign-up detour, and accepts it now that the account exists. Best-effort
 * — mirrors attachReferralFromCookie's "never fail signup over this".
 */
export async function attachFamilyInviteFromCookie(newUserId: string): Promise<void> {
  const store = await cookies();
  const token = store.get(FAMILY_INVITE_COOKIE)?.value?.trim();
  if (!token) return;

  const admin = getAdminSupabase();
  if (!admin) return;

  const { error } = await admin.rpc("accept_family_invite", {
    p_token: token,
    p_user_id: newUserId,
  });
  if (error) {
    console.error("[family] cookie attach failed:", error);
  }
}
