"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PHASE_META } from "@/lib/steps";
import { MOCK_DOCS, type MockDoc } from "@/lib/mock-documents";
import { Modal } from "@/components/ui/Modal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { timeAgo } from "@/lib/relative-time";
import {
  createSignedUpload,
  deleteDocument,
  getSignedDownloadUrl,
  listDocuments,
  recordUpload,
  undeleteDocument,
  type DocRecord,
} from "@/app/actions/documents";
import { getBrowserSupabase } from "@/lib/supabase/client";

type Plan = "free" | "solo" | "family";

type Props = {
  plan: Plan;
  isReal?: boolean;
};

const STORAGE_LIMIT_KB: Record<Plan, number> = {
  free: 50_000,
  solo: 2_000_000,
  family: 2_000_000,
};
const MAX_FILE_BYTES = 10 * 1024 * 1024;

function FileIcon({ type }: { type: DocRecord["type"] }) {
  return (
    <span aria-hidden className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border-soft)] bg-[var(--color-surface)] text-[var(--color-ink-soft)]">
      {type === "image" ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5" />
        </svg>
      )}
    </span>
  );
}

function ChevronDown({ className = "" }: { className?: string }) {
  return <svg viewBox="0 0 24 24" className={`h-3 w-3 ${className}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 9l6 6 6-6" /></svg>;
}
function MoreIcon() {
  return <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></svg>;
}
function UploadIcon() {
  return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>;
}
function PdfIcon() {
  return <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="M9 14h6M9 18h4" /></svg>;
}

function formatBytes(kb: number): string {
  if (kb < 1000) return `${kb} KB`;
  if (kb < 1_000_000) return `${(kb / 1000).toFixed(1)} MB`;
  return `${(kb / 1_000_000).toFixed(2)} GB`;
}

function StatTile({ label, value, hint, danger }: { label: string; value: React.ReactNode; hint?: string; danger?: boolean }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-cream-soft)] p-4 sm:p-5">
      <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--color-muted)] font-medium">{label}</div>
      <div className={`mt-2 font-display text-2xl sm:text-3xl tracking-tight tabular-nums leading-none ${danger ? "text-red-600" : "text-[var(--color-forest)]"}`}>
        {value}
      </div>
      {hint && <div className="mt-1 text-[11px] text-[var(--color-muted)]">{hint}</div>}
    </div>
  );
}

function mockToRecord(m: MockDoc): DocRecord {
  return { ...m, storagePath: `mock/${m.id}` };
}

export function DocumentsClient({ plan, isReal = false }: Props) {
  const [docs, setDocs] = useState<DocRecord[]>(
    isReal ? [] : MOCK_DOCS.map(mockToRecord),
  );
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<DocRecord | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState<{ msg: string; undoId?: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!isReal) return;
    const res = await listDocuments();
    if (res.ok) setDocs(res.data);
  }, [isReal]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!preview) {
      setPreviewUrl(null);
      return;
    }
    if (!isReal) return;
    let active = true;
    (async () => {
      const res = await getSignedDownloadUrl(preview.storagePath);
      if (active && res.ok) setPreviewUrl(res.data.url);
    })();
    return () => { active = false; };
  }, [preview, isReal]);

  const togglePhase = (n: number) => {
    setCollapsed((p) => {
      const next = new Set(p);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  };

  const totalUploaded = docs.length;
  const required = 47;
  const requiredUploaded = docs.filter((d) => d.required).length;
  const requiredMissing = Math.max(0, 20 - requiredUploaded);
  const storageLimit = STORAGE_LIMIT_KB[plan];
  const storageUsed = docs.reduce((n, d) => n + d.sizeKb, 0);
  const storagePct = Math.round((storageUsed / storageLimit) * 100);
  const expiringSoon = docs.filter((d) => {
    if (!d.expiresAt) return false;
    const days = (d.expiresAt.getTime() - Date.now()) / 86_400_000;
    return days > 0 && days <= 30;
  }).length;

  const phases = useMemo(() => {
    return PHASE_META.map((p) => {
      const phaseDocs = docs.filter((d) => d.phase === p.number);
      const required = phaseDocs.filter((d) => d.required).length;
      return { ...p, docs: phaseDocs, required };
    });
  }, [docs]);

  const showToast = (msg: string, undoId?: string) => {
    setToast({ msg, undoId });
    setTimeout(() => setToast((t) => (t?.msg === msg ? null : t)), 6000);
  };

  const uploadFile = useCallback(async (f: File) => {
    if (f.size > MAX_FILE_BYTES) {
      showToast(`"${f.name}" exceeds 10MB limit.`);
      return;
    }
    if (plan === "free" && (storageUsed + Math.round(f.size / 1024)) > storageLimit) {
      showToast("Free tier storage full. Upgrade for 2GB.");
      return;
    }

    if (!isReal) {
      // Mock mode: keep optimistic local state
      const newDoc: DocRecord = {
        id: `up-${Date.now()}-${f.name}`,
        name: f.name,
        filename: f.name,
        step: 1,
        phase: 1,
        sizeKb: Math.round(f.size / 1024),
        uploadedAt: new Date(),
        expiresAt: null,
        required: false,
        type: f.type.startsWith("image") ? "image" : f.type === "application/pdf" ? "pdf" : "doc",
        storagePath: `mock/${Date.now()}`,
      };
      setDocs((d) => [newDoc, ...d]);
      return;
    }

    const sb = getBrowserSupabase();
    if (!sb) {
      showToast("Storage unavailable.");
      return;
    }
    setBusy(true);
    try {
      const signed = await createSignedUpload(f.name);
      if (!signed.ok) { showToast(signed.error); return; }
      const { error } = await sb.storage
        .from("documents")
        .uploadToSignedUrl(signed.data.storagePath, signed.data.token, f, {
          contentType: f.type || "application/octet-stream",
        });
      if (error) { showToast(error.message); return; }
      const rec = await recordUpload({
        storagePath: signed.data.storagePath,
        name: f.name,
        filename: f.name,
        sizeBytes: f.size,
        mimeType: f.type || "application/octet-stream",
      });
      if (!rec.ok) { showToast(rec.error); return; }
      await refresh();
    } finally {
      setBusy(false);
    }
  }, [isReal, plan, refresh, storageLimit, storageUsed]);

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    for (const f of files) await uploadFile(f);
    if (files.length) showToast(`Uploaded ${files.length} file${files.length === 1 ? "" : "s"}`);
  };

  const handleDelete = async (id: string) => {
    const removed = docs.find((d) => d.id === id);
    if (!removed) return;
    setActionMenu(null);

    if (!isReal) {
      setDocs((d) => d.filter((x) => x.id !== id));
      showToast(`Removed "${removed.name}"`);
      return;
    }

    setDocs((d) => d.filter((x) => x.id !== id));
    const res = await deleteDocument(id);
    if (!res.ok) {
      showToast(res.error);
      void refresh();
      return;
    }
    showToast(`Removed "${removed.name}" · click to undo`, id);
  };

  const handleUndo = async () => {
    if (!toast?.undoId) return;
    const id = toast.undoId;
    setToast(null);
    if (isReal) {
      await undeleteDocument(id);
      await refresh();
    }
  };

  const handleDownload = async (d: DocRecord) => {
    setActionMenu(null);
    if (!isReal) { showToast("Download wires up with real storage."); return; }
    const res = await getSignedDownloadUrl(d.storagePath);
    if (!res.ok) { showToast(res.error); return; }
    window.open(res.data.url, "_blank", "noopener,noreferrer");
  };

  const generatePdf = async () => {
    if (plan === "free") {
      showToast("Interview Day PDF is part of paid plans.");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/documents/interview-pdf", { method: "POST" });
      if (!res.ok) {
        showToast("PDF generation failed.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "interview-day.pdf";
      a.click();
      URL.revokeObjectURL(url);
      showToast("Interview Day PDF ready · downloaded.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
        <Link href="/dashboard" className="hover:text-[var(--color-ink)] transition-colors">Dashboard</Link>
        <span aria-hidden>→</span>
        <span className="text-[var(--color-ink-soft)]">Documents</span>
      </nav>

      <header className="mt-6 animate-hero-rise">
        <Eyebrow>Your documents</Eyebrow>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl tracking-tight text-[var(--color-ink)] leading-tight">
          Everything in <span className="text-[var(--color-forest)]">one place</span>.
        </h1>
        <p className="mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-[var(--color-ink-soft)]">
          Upload, label, and verify every paper your officer might ask for —
          in the exact order they expect it at the window.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={generatePdf}
            disabled={generating}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-forest)] px-5 py-2.5 text-sm font-medium text-[var(--color-cream-soft)] hover:bg-[var(--color-forest-deep)] transition-colors disabled:opacity-60"
          >
            {generating ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-current animate-soft-pulse" />
                Building your PDF…
              </>
            ) : (
              <>
                <PdfIcon /> Generate Interview Day PDF
              </>
            )}
          </button>
          <label className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-transparent px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent-deep)] transition-colors cursor-pointer">
            <UploadIcon />
            {busy ? "Uploading…" : "Upload documents"}
            <input type="file" multiple className="sr-only" onChange={async (e) => {
              const files = Array.from(e.target.files ?? []);
              for (const f of files) await uploadFile(f);
              if (files.length) showToast(`Uploaded ${files.length} file${files.length === 1 ? "" : "s"}`);
              e.target.value = "";
            }} />
          </label>
        </div>
      </header>

      <section className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 animate-fade-up">
        <StatTile label="Uploaded" value={totalUploaded} hint={`Of ~${required} typical`} />
        <StatTile label="Required missing" value={requiredMissing} danger={requiredMissing > 0} hint={requiredMissing > 0 ? "Check phase sections below" : "All on file"} />
        <StatTile label="Storage" value={formatBytes(storageUsed)} hint={`${storagePct}% of ${formatBytes(storageLimit)}`} />
        <StatTile label="Expiring soon" value={expiringSoon} hint={expiringSoon > 0 ? "Within 30 days" : "Nothing imminent"} />
      </section>

      <section
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={[
          "mt-6 rounded-2xl border border-dashed p-8 text-center transition-colors",
          dragOver
            ? "border-[var(--color-accent)] bg-[var(--color-accent-tint)]"
            : "border-[var(--color-border)] bg-[var(--color-cream-soft)]",
        ].join(" ")}
      >
        <UploadIcon />
        <p className="mt-3 text-sm font-medium text-[var(--color-ink)]">
          Drop files here, or use Upload documents above.
        </p>
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          PDF, JPG, PNG. Max 10MB per file. {plan === "free" ? "Free tier: 50MB total." : "Solo / Family: 2GB total."}
        </p>
      </section>

      <div className="mt-10 space-y-4">
        {phases.map((p) => {
          const isCollapsed = collapsed.has(p.number);
          const total = p.docs.length;
          const required = p.required;
          return (
            <section key={p.id} className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-cream-soft)] overflow-hidden animate-fade-up">
              <button
                type="button"
                onClick={() => togglePhase(p.number)}
                aria-expanded={!isCollapsed}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-[var(--color-cream)]/40 transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-accent-deep)]">
                    Phase {String(p.number).padStart(2, "0")}
                  </div>
                  <h2 className="mt-1 font-display text-xl text-[var(--color-ink)] leading-snug tracking-tight">
                    {p.name}
                  </h2>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <div className="font-display text-xl text-[var(--color-forest)] tabular-nums leading-none">
                      {total}
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--color-muted)] mt-1">
                      Docs · {required} req
                    </div>
                  </div>
                  <ChevronDown className={isCollapsed ? "" : "rotate-180 transition-transform"} />
                </div>
              </button>

              {!isCollapsed && p.docs.length > 0 && (
                <ul className="divide-y divide-[var(--color-border-soft)] border-t border-[var(--color-border-soft)]">
                  {p.docs.map((d) => {
                    const isExpiring =
                      d.expiresAt &&
                      (d.expiresAt.getTime() - Date.now()) / 86_400_000 <= 30 &&
                      d.expiresAt.getTime() > Date.now();
                    return (
                      <li
                        key={d.id}
                        className={[
                          "relative flex items-center gap-3 px-4 sm:px-5 py-3",
                          isExpiring ? "bg-amber-50/60" : "",
                        ].join(" ")}
                      >
                        <FileIcon type={d.type} />
                        <div className="flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={() => setPreview(d)}
                            className="text-left w-full"
                          >
                            <div className="text-sm font-medium text-[var(--color-ink)] truncate">{d.name}</div>
                            <div className="mt-0.5 text-[11px] text-[var(--color-muted)] flex flex-wrap items-center gap-2">
                              <span>Step {d.step}</span>
                              <span aria-hidden className="h-0.5 w-0.5 rounded-full bg-[var(--color-border)]" />
                              <span>{d.uploadedAt ? `Uploaded ${timeAgo(d.uploadedAt)}` : "Not yet uploaded"}</span>
                              <span aria-hidden className="h-0.5 w-0.5 rounded-full bg-[var(--color-border)]" />
                              <span>{formatBytes(d.sizeKb)}</span>
                              {isExpiring && (
                                <>
                                  <span aria-hidden className="h-0.5 w-0.5 rounded-full bg-[var(--color-border)]" />
                                  <span className="text-amber-700">Expiring soon</span>
                                </>
                              )}
                            </div>
                          </button>
                        </div>
                        <button
                          type="button"
                          aria-label="Document actions"
                          onClick={() => setActionMenu(actionMenu === d.id ? null : d.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border-soft)] bg-[var(--color-surface)] text-[var(--color-ink-soft)] hover:border-[var(--color-border)] transition-colors"
                        >
                          <MoreIcon />
                        </button>

                        {actionMenu === d.id && (
                          <div className="absolute right-4 top-12 z-20 w-40 rounded-xl border border-[var(--color-border)] bg-[var(--color-cream-soft)] shadow-[0_30px_80px_-30px_rgba(20,33,28,0.25)] py-1 text-sm animate-fade-up">
                            {[
                              { label: "View", onClick: () => { setPreview(d); setActionMenu(null); } },
                              { label: "Download", onClick: () => handleDownload(d) },
                              { label: "Delete", onClick: () => handleDelete(d.id), danger: true },
                            ].map((a) => (
                              <button
                                key={a.label}
                                type="button"
                                onClick={a.onClick}
                                className={[
                                  "w-full text-left px-3 py-1.5 hover:bg-[var(--color-cream-deep)] transition-colors",
                                  a.danger ? "text-red-600" : "text-[var(--color-ink)]",
                                ].join(" ")}
                              >
                                {a.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}

              {!isCollapsed && p.docs.length === 0 && (
                <div className="border-t border-[var(--color-border-soft)] px-5 py-6 text-sm text-[var(--color-muted)] text-center">
                  Nothing uploaded for this phase yet.
                </div>
              )}
            </section>
          );
        })}
      </div>

      {plan === "free" && (
        <section className="mt-8 rounded-2xl border border-[var(--color-forest)] bg-[var(--color-forest)] text-[var(--color-cream-soft)] p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="max-w-md">
            <p className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-accent-soft)]">
              Storage cap
            </p>
            <h3 className="mt-2 font-display text-xl leading-snug">Free is 50MB. Solo gives you 2GB.</h3>
            <p className="mt-2 text-sm text-[var(--color-cream-soft)]/80">
              Plus the auto-generated Interview Day PDF and unlimited uploads.
            </p>
          </div>
          <Link href="/dashboard/upgrade">
            <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-cream-soft)] px-5 py-2.5 text-sm font-medium text-[var(--color-forest)] hover:bg-[var(--color-cream-deep)] transition-colors">
              Unlock 2GB →
            </button>
          </Link>
        </section>
      )}

      <Modal
        open={!!preview}
        onClose={() => setPreview(null)}
        eyebrow={preview ? `Phase ${preview.phase} · Step ${preview.step}` : ""}
        title={preview?.name ?? ""}
        maxWidth="max-w-4xl"
      >
        {preview && (
          <div className="aspect-[4/3] rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-cream-deep)]/40 flex items-center justify-center overflow-hidden">
            {previewUrl ? (
              preview.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt={preview.name} className="h-full w-full object-contain" />
              ) : (
                <iframe src={previewUrl} title={preview.name} className="h-full w-full" />
              )
            ) : (
              <div className="text-center text-[var(--color-muted)]">
                <FileIcon type={preview.type} />
                <p className="mt-3 text-sm">{preview.filename}</p>
                <p className="text-xs">{formatBytes(preview.sizeKb)} · uploaded {preview.uploadedAt ? timeAgo(preview.uploadedAt) : "—"}</p>
                <p className="mt-4 text-xs italic">{isReal ? "Loading…" : "Preview wires up with real storage."}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {toast && (
        <button
          type="button"
          onClick={toast.undoId ? handleUndo : () => setToast(null)}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-up"
        >
          <span className="inline-flex items-center gap-3 rounded-xl bg-[var(--color-forest)] px-5 py-3 text-sm font-medium text-[var(--color-cream-soft)] shadow-[0_18px_40px_-15px_rgba(20,33,28,0.45)]">
            {toast.msg}
          </span>
        </button>
      )}
    </div>
  );
}
