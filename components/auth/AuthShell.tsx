import type { ReactNode } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/ui/BrandMark";

type Props = {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  children: ReactNode;
  /** Optional small text under the card (e.g. "Already have an account? Sign in"). */
  belowCard?: ReactNode;
  /**
   * When true, switches the aurora backdrop for a warm afternoon gradient
   * picked from the cinematic-hero palette (cream → gold → cream-deep) with
   * three soft glow blobs and a low-contrast paper card. No image, no glass.
   */
  background?: boolean;
  /**
   * When set, uses this image (path under /public) as the full-bleed page
   * background with a dark scrim on top. Takes precedence over `background`.
   * Scoped per-page so only the caller that opts in (sign-in) changes.
   */
  bgImage?: string;
};

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  belowCard,
  background = false,
  bgImage,
}: Props) {
  return (
    <main
      className="relative min-h-screen flex flex-col overflow-hidden bg-[var(--color-paper)]"
      style={
        bgImage
          ? {
              backgroundImage: `url('${bgImage}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }
          : undefined
      }
    >
      {bgImage ? (
        <div
          aria-hidden
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ background: "rgba(28,25,23,0.35)" }}
        />
      ) : background ? (
        <>
          {/* Warm base gradient — cream paper with afternoon-gold pooling */}
          <div
            aria-hidden
            className="absolute inset-0 z-0"
            style={{
              background:
                "radial-gradient(120% 100% at 18% 12%, rgba(245, 213, 144, 0.55) 0%, rgba(245, 213, 144, 0) 55%), " +
                "radial-gradient(110% 90% at 82% 88%, rgba(245, 213, 144, 0.30) 0%, rgba(245, 213, 144, 0) 60%), " +
                "radial-gradient(80% 60% at 50% 50%, rgba(20, 58, 47, 0.06) 0%, rgba(20, 58, 47, 0) 70%), " +
                "linear-gradient(180deg, var(--color-paper-soft) 0%, var(--color-paper) 100%)",
            }}
          />

          {/* Dark mode replacement — cool moonlight tones on the void canvas */}
          <div
            aria-hidden
            className="absolute inset-0 z-0 hidden dark:block"
            style={{
              background:
                "radial-gradient(120% 100% at 18% 12%, rgba(188, 212, 240, 0.18) 0%, rgba(188, 212, 240, 0) 55%), " +
                "radial-gradient(110% 90% at 82% 88%, rgba(188, 212, 240, 0.12) 0%, rgba(188, 212, 240, 0) 60%), " +
                "linear-gradient(180deg, #0a0a0a 0%, #000000 100%)",
            }}
          />

          {/* Three drifting blobs in the same warm gold for depth */}
          <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            <span
              className="absolute rounded-full opacity-[0.55] dark:opacity-[0.18]"
              style={{
                width: 520,
                height: 520,
                left: "-12%",
                top: "8%",
                background:
                  "radial-gradient(circle, rgba(245, 213, 144, 0.7) 0%, transparent 65%)",
                filter: "blur(38px)",
              }}
            />
            <span
              className="absolute rounded-full opacity-[0.5] dark:opacity-[0.18]"
              style={{
                width: 420,
                height: 420,
                right: "-8%",
                top: "32%",
                background:
                  "radial-gradient(circle, rgba(255, 232, 178, 0.55) 0%, transparent 65%)",
                filter: "blur(40px)",
              }}
            />
            <span
              className="absolute rounded-full opacity-[0.4] dark:opacity-[0.14]"
              style={{
                width: 460,
                height: 460,
                left: "30%",
                bottom: "-12%",
                background:
                  "radial-gradient(circle, rgba(20, 58, 47, 0.32) 0%, transparent 65%)",
                filter: "blur(48px)",
              }}
            />
          </div>

          {/* Subtle paper grain overlay */}
          <div
            aria-hidden
            className="absolute inset-0 z-0 pointer-events-none opacity-[0.04] dark:opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 25% 30%, rgba(20,33,28,0.5) 0.5px, transparent 1px), " +
                "radial-gradient(circle at 75% 70%, rgba(20,33,28,0.4) 0.5px, transparent 1px)",
              backgroundSize: "4px 4px, 5px 5px",
            }}
          />
        </>
      ) : (
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
          <span className="aurora-blob aurora-blob-1" />
          <span className="aurora-blob aurora-blob-2" />
          <span className="aurora-blob aurora-blob-3" />
        </div>
      )}

      {/* Centered column */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-5 py-8 sm:py-12">
        <div className="w-full max-w-md">
          {/* Brand top-center */}
          <Link
            href="/"
            aria-label="GetStamped — home"
            className="flex items-center justify-center gap-2.5 mb-8 mx-auto w-fit text-[var(--color-ink)] dark:text-[var(--color-paper)] hover:opacity-90 transition-opacity"
          >
            <span className="inline-flex items-center justify-center rounded-full bg-[var(--color-paper-soft)] dark:bg-[var(--color-ink)] p-1.5 ring-1 ring-[var(--color-border)] dark:ring-white/15">
              <BrandMark size={26} />
            </span>
            <span className="font-display text-[26px] leading-none tracking-tight">
              GetStamped
            </span>
          </Link>

          {/* Card — same surface in both modes; airy, paper-like */}
          <div
            className="relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper-soft)] p-7 sm:p-10"
            style={{
              boxShadow:
                "0 30px 80px -28px rgba(20, 33, 28, 0.22), 0 0 0 1px rgba(255, 255, 255, 0.5) inset",
            }}
          >
            {/* Gold filament along the top edge — pulls in the wire palette */}
            {background && (
              <span
                aria-hidden
                className="absolute inset-x-8 top-0 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.55) 50%, transparent 100%)",
                }}
              />
            )}

            <div className="text-center">
              <p className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-muted)]">
                {eyebrow}
              </p>
              <h1 className="mt-3 font-display text-2xl sm:text-3xl tracking-tight leading-snug text-[var(--color-ink)]">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-3 text-sm leading-relaxed max-w-sm mx-auto text-[var(--color-ink-soft)]">
                  {subtitle}
                </p>
              )}
            </div>

            <div className="mt-7">{children}</div>
          </div>

          {belowCard && (
            <p className="mt-6 text-center text-sm font-medium text-[var(--color-ink)] dark:text-[var(--color-paper)]">
              {belowCard}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
