"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { verifyEmailCode, resendVerification } from "@/app/actions/auth";

/**
 * 6-digit OTP code form. Six independent boxes so paste-from-email and
 * arrow-key nav both work. Submits the joined code via verifyEmailCode.
 *
 * Resend control sits below — calls resendVerification, then locks the
 * button for 30 seconds so users don't hammer Supabase's mailer.
 */
export function VerifyCodeForm({ email }: { email: string }) {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [pending, startPending] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [resentAt, setResentAt] = useState<number | null>(null);
  const [resending, setResending] = useState(false);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => { refs.current[0]?.focus(); }, []);

  const code = digits.join("");
  const full = code.length === 6 && /^\d{6}$/.test(code);

  const submit = (value?: string) => {
    const c = (value ?? code).replace(/\s+/g, "");
    if (!/^\d{6}$/.test(c)) return;
    setError(null);
    startPending(async () => {
      const r = await verifyEmailCode(email, c);
      if (r.ok) {
        router.push(r.redirectTo ?? "/dashboard");
        router.refresh();
      } else {
        setError(r.error);
        // Clear and re-focus first box so they can re-type.
        setDigits(["", "", "", "", "", ""]);
        refs.current[0]?.focus();
      }
    });
  };

  const onChange = (i: number, raw: string) => {
    const v = raw.replace(/\D/g, "");
    if (v.length === 0) {
      // Backspace from a box clears it; arrow handled separately.
      const next = [...digits]; next[i] = ""; setDigits(next);
      return;
    }
    if (v.length === 1) {
      const next = [...digits]; next[i] = v; setDigits(next);
      if (i < 5) refs.current[i + 1]?.focus();
      else if (full || next.join("").length === 6) submit(next.join(""));
      return;
    }
    // Paste flow — distribute across boxes from current position.
    const incoming = v.slice(0, 6 - i).split("");
    const next = [...digits];
    incoming.forEach((d, k) => { next[i + k] = d; });
    setDigits(next);
    const last = Math.min(5, i + incoming.length);
    refs.current[last]?.focus();
    if (next.join("").length === 6) submit(next.join(""));
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      e.preventDefault();
      const next = [...digits]; next[i - 1] = ""; setDigits(next);
      refs.current[i - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && i > 0)  refs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) refs.current[i + 1]?.focus();
    if (e.key === "Enter" && full) submit();
  };

  const onResend = async () => {
    if (resending) return;
    if (resentAt && Date.now() - resentAt < 30_000) return;
    setResending(true);
    setError(null);
    const r = await resendVerification(email);
    setResending(false);
    if (r.ok) setResentAt(Date.now());
    else setError(r.error);
  };

  const cooldownRemaining = resentAt
    ? Math.max(0, 30 - Math.floor((Date.now() - resentAt) / 1000))
    : 0;

  return (
    <div className="vc-root">
      <p className="vc-help">
        Enter the 6-digit code we sent to{" "}
        <span className="vc-email">{email}</span>.
      </p>

      <div
        className="vc-boxes"
        role="group"
        aria-label="6-digit verification code"
        onPaste={(e) => {
          const text = e.clipboardData.getData("text").replace(/\D/g, "");
          if (text.length >= 6) {
            e.preventDefault();
            onChange(0, text.slice(0, 6));
          }
        }}
      >
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            value={d}
            onChange={(e) => onChange(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={1}
            aria-label={`Digit ${i + 1}`}
            className="vc-box"
            disabled={pending}
          />
        ))}
      </div>

      {error ? <p className="vc-err">{error}</p> : null}
      {resentAt && Date.now() - resentAt < 4000 && !error ? (
        <p className="vc-ok">Fresh code sent.</p>
      ) : null}

      <button
        type="button"
        className="vc-submit"
        onClick={() => submit()}
        disabled={!full || pending}
      >
        {pending ? "Verifying…" : "Verify"}
      </button>

      <button
        type="button"
        className="vc-resend"
        onClick={onResend}
        disabled={resending || cooldownRemaining > 0}
      >
        {resending ? "Sending…"
         : cooldownRemaining > 0 ? `Resend in ${cooldownRemaining}s`
         : "Resend code"}
      </button>

      <style>{`
        .vc-root { display: flex; flex-direction: column; gap: 18px; }
        .vc-help {
          font-size: 14px;
          color: var(--color-ink-soft);
          line-height: 1.55;
        }
        .vc-email { color: var(--color-ink); font-weight: 600; }

        .vc-boxes {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 10px;
        }
        .vc-box {
          width: 100%; aspect-ratio: 1;
          text-align: center;
          font-family: var(--font-mono-stack);
          font-size: clamp(22px, 5vw, 28px); font-weight: 600;
          color: var(--color-ink);
          background: var(--color-paper-soft);
          border: 1.5px solid var(--color-border);
          border-radius: 10px;
          outline: none;
          transition: border-color 180ms var(--ease-soft),
            box-shadow 180ms var(--ease-soft),
            background-color 180ms var(--ease-soft);
          caret-color: var(--color-persimmon);
        }
        .vc-box:focus {
          border-color: var(--color-persimmon);
          box-shadow: 0 0 0 4px rgba(255, 91, 46, 0.12);
        }
        .vc-box:disabled { opacity: 0.55; cursor: not-allowed; }

        .vc-err {
          font-size: 13px;
          color: var(--color-persimmon-deep);
        }
        .vc-ok {
          font-size: 13px;
          color: #1E6B41;
        }
        html.dark .vc-ok {
          color: #4ADE80;
        }

        .vc-submit {
          all: unset; cursor: pointer;
          height: 48px; padding: 0 24px;
          background: var(--color-persimmon); color: var(--color-paper-soft);
          font-size: 14.5px; font-weight: 600;
          display: inline-flex; align-items: center; justify-content: center;
          border-radius: 10px;
          transition: background-color 200ms var(--ease-soft),
            transform 160ms var(--ease-soft);
        }
        .vc-submit:hover:not(:disabled) { background: var(--color-persimmon-deep); }
        .vc-submit:active:not(:disabled) { transform: scale(0.98); }
        .vc-submit:disabled { background: rgba(28,25,23,0.20); cursor: not-allowed; }

        .vc-resend {
          all: unset; cursor: pointer;
          font-size: 13.5px;
          color: var(--color-ink-soft);
          align-self: center;
          padding: 8px 4px;
          transition: color 200ms var(--ease-soft);
        }
        .vc-resend:hover:not(:disabled) { color: var(--color-persimmon); }
        .vc-resend:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
