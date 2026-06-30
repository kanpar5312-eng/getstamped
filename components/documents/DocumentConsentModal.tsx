"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";

/* ════════════════════════════════════════════════════════════════════════
   DocumentConsentModal — first-time privacy modal for the Document Vault.

   DPDP Act compliance — affirmative consent. Shown to a user the first
   time they try to upload a document; suppressed thereafter once the
   server records consent for the current version constant.
   ════════════════════════════════════════════════════════════════════════ */

type Props = {
  open: boolean;
  /** Called when the user explicitly cancels (close button, backdrop,
   *  Esc, or the Cancel button). The pending upload should NOT proceed. */
  onCancel: () => void;
  /** Called after the consent has been successfully recorded server-side.
   *  Parent should then run the queued upload and flip its local
   *  consent-given state so future uploads bypass the modal. */
  onConfirmed: () => void;
};

export function DocumentConsentModal({ open, onCancel, onConfirmed }: Props) {
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setAgreed(false);
    setSubmitting(false);
    setError(null);
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  const handleContinue = async () => {
    if (!agreed || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch("/api/documents/consent", { method: "POST" });
      if (!r.ok) {
        setError("Could not record your confirmation. Try again.");
        setSubmitting(false);
        return;
      }
      reset();
      onConfirmed();
    } catch {
      setError("Could not record your confirmation. Try again.");
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleCancel}
      eyebrow="Document Vault"
      title="Before you upload"
      maxWidth="max-w-lg"
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleCancel}
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] bg-transparent px-4 py-2 text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] hover:border-[var(--color-border-strong)] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleContinue}
            disabled={!agreed || submitting}
            className="inline-flex items-center justify-center rounded-lg bg-[var(--color-persimmon)] px-4 py-2 text-sm font-medium text-[var(--color-paper-soft)] hover:bg-[var(--color-persimmon-deep)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Saving…" : "Continue"}
          </button>
        </div>
      }
    >
      <div className="space-y-4 text-[15px] leading-relaxed text-[var(--color-ink-soft)]">
        <p>
          Your document is scanned by AI to check for common formatting
          issues — then permanently deleted from our servers within minutes.
          We never store your passport, I-20, bank statements, or any
          document image long-term.
        </p>

        <div className="rounded-lg border border-[var(--color-border-soft)] bg-[var(--color-paper-soft)] p-3 text-sm">
          <p className="text-[var(--color-ink)]">
            <span className="font-medium">What we keep:</span> a simple
            checklist result (e.g. &ldquo;signature: verified&rdquo;).
          </p>
          <p className="mt-2 text-[var(--color-ink)]">
            <span className="font-medium">What we don&rsquo;t keep:</span> the
            document itself, any extracted personal data, or copies anywhere.
          </p>
        </div>

        <p className="text-[13px] text-[var(--color-muted)]">
          This is an automated formatting check, not a legal review. For
          full verification, consult your DSO or an immigration attorney.
        </p>

        <label className="mt-2 flex items-start gap-3 cursor-pointer select-none rounded-lg p-3 hover:bg-[var(--color-paper-soft)] transition-colors">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[var(--color-persimmon)] cursor-pointer"
            aria-describedby="consent-label"
          />
          <span
            id="consent-label"
            className="text-sm text-[var(--color-ink)]"
          >
            I understand and agree to proceed
          </span>
        </label>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}
