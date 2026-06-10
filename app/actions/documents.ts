"use server";

import { revalidatePath } from "next/cache";
import { getServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { stepByNumber } from "@/lib/steps";

export type DocRecord = {
  id: string;
  name: string;
  filename: string;
  step: number;
  phase: number;
  sizeKb: number;
  uploadedAt: Date | null;
  expiresAt: Date | null;
  required: boolean;
  type: "pdf" | "image" | "doc";
  storagePath: string;
};

export type DocResult<T = void> = ({ ok: true } & (T extends void ? object : { data: T })) | { ok: false; error: string };

const BUCKET = "documents";

function mimeToType(mime: string | null | undefined): DocRecord["type"] {
  if (!mime) return "doc";
  if (mime.startsWith("image/")) return "image";
  if (mime === "application/pdf") return "pdf";
  return "doc";
}

async function requireUser() {
  if (!isSupabaseConfigured()) return { ok: false as const, error: "Auth not configured." };
  const sb = await getServerSupabase();
  if (!sb) return { ok: false as const, error: "Supabase unavailable." };
  const { data, error } = await sb.auth.getUser();
  if (error || !data.user) return { ok: false as const, error: "Not signed in." };
  return { ok: true as const, sb, userId: data.user.id };
}

export async function listDocuments(): Promise<DocResult<DocRecord[]>> {
  const u = await requireUser();
  if (!u.ok) return { ok: true, data: [] };

  const { data, error } = await u.sb
    .from("documents")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) return { ok: false, error: error.message };

  const rows: DocRecord[] = (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    filename: r.filename,
    step: r.step_number ?? 1,
    phase: r.phase ?? 1,
    sizeKb: Math.max(1, Math.round((r.size_bytes ?? 0) / 1024)),
    uploadedAt: r.created_at ? new Date(r.created_at) : null,
    expiresAt: r.expires_at ? new Date(r.expires_at) : null,
    required: !!r.required,
    type: mimeToType(r.mime_type),
    storagePath: r.storage_path,
  }));
  return { ok: true, data: rows };
}

/** Returns a signed upload URL the browser can PUT to directly. */
export async function createSignedUpload(
  filename: string,
  stepNumber?: number,
): Promise<DocResult<{ uploadUrl: string; token: string; storagePath: string }>> {
  const u = await requireUser();
  if (!u.ok) return { ok: false, error: u.error };

  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  const step = stepNumber && Number.isFinite(stepNumber) ? stepNumber : 0;
  const path = `${u.userId}/${step}/${Date.now()}-${safeName}`;

  const { data, error } = await u.sb.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error || !data) return { ok: false, error: error?.message ?? "Could not create upload URL." };

  return { ok: true, data: { uploadUrl: data.signedUrl, token: data.token, storagePath: data.path } };
}

/** Records a document row after the browser finishes the upload. */
export async function recordUpload(input: {
  storagePath: string;
  name: string;
  filename: string;
  sizeBytes: number;
  mimeType: string;
  stepNumber?: number;
}): Promise<DocResult> {
  const u = await requireUser();
  if (!u.ok) return { ok: false, error: u.error };

  const step = input.stepNumber && Number.isFinite(input.stepNumber) ? input.stepNumber : null;
  const phase = step ? stepByNumber(step)?.phase ?? null : null;

  const { error } = await u.sb.from("documents").insert({
    user_id: u.userId,
    storage_path: input.storagePath,
    name: input.name,
    filename: input.filename,
    size_bytes: input.sizeBytes,
    mime_type: input.mimeType,
    step_number: step,
    phase,
  });
  if (error) return { ok: false, error: error.message };

  await u.sb.from("step_activity").insert({
    user_id: u.userId,
    step_number: step,
    action: "document_uploaded",
  });

  revalidatePath("/dashboard/documents");
  return { ok: true };
}

export async function deleteDocument(id: string): Promise<DocResult> {
  const u = await requireUser();
  if (!u.ok) return { ok: false, error: u.error };

  const { data: row, error: readErr } = await u.sb
    .from("documents")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();
  if (readErr) return { ok: false, error: readErr.message };
  if (!row) return { ok: false, error: "Not found." };

  // Soft-delete the row first (lets us undo within the toast window).
  const { error: updErr } = await u.sb
    .from("documents")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (updErr) return { ok: false, error: updErr.message };

  revalidatePath("/dashboard/documents");
  return { ok: true };
}

export async function undeleteDocument(id: string): Promise<DocResult> {
  const u = await requireUser();
  if (!u.ok) return { ok: false, error: u.error };
  const { error } = await u.sb
    .from("documents")
    .update({ deleted_at: null })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/documents");
  return { ok: true };
}

/** Permanently removes the row + the underlying object. */
export async function purgeDocument(id: string): Promise<DocResult> {
  const u = await requireUser();
  if (!u.ok) return { ok: false, error: u.error };
  const { data: row } = await u.sb
    .from("documents")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();
  if (row?.storage_path) {
    await u.sb.storage.from(BUCKET).remove([row.storage_path]);
  }
  await u.sb.from("documents").delete().eq("id", id);
  revalidatePath("/dashboard/documents");
  return { ok: true };
}

export async function getSignedDownloadUrl(
  storagePath: string,
): Promise<DocResult<{ url: string }>> {
  const u = await requireUser();
  if (!u.ok) return { ok: false, error: u.error };
  const { data, error } = await u.sb.storage.from(BUCKET).createSignedUrl(storagePath, 60 * 10);
  if (error || !data) return { ok: false, error: error?.message ?? "Could not sign URL." };
  return { ok: true, data: { url: data.signedUrl } };
}
