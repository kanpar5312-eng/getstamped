import "server-only";
import { getAdminSupabase } from "@/lib/documents/admin";

export type NotificationKind =
  | "step_complete"
  | "step_started"
  | "doc_checked"
  | "doc_attention"
  | "interview_reminder"
  | "parent_view_viewed"
  | "welcome"
  | "generic";

export type CreateNotificationInput = {
  userId: string;
  kind: NotificationKind;
  title: string;
  body?: string;
  href?: string;
};

/**
 * Insert a notification for a user. Goes through the service-role client so
 * it bypasses RLS (RLS doesn't allow inserts; only server can write).
 * Realtime listeners attached client-side pick it up automatically.
 */
export async function pushNotification(input: CreateNotificationInput): Promise<{ ok: boolean }> {
  const sb = getAdminSupabase();
  if (!sb) return { ok: false };
  const { error } = await sb.from("notifications").insert({
    user_id: input.userId,
    kind: input.kind,
    title: input.title,
    body: input.body ?? null,
    href: input.href ?? null,
  });
  return { ok: !error };
}
