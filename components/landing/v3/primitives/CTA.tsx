import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Props = ComponentProps<typeof Link> & {
  tone?: "primary" | "ghost" | "ghost-light";
  size?: "md" | "lg";
  children: ReactNode;
};

export function CTA({ tone = "primary", size = "lg", className = "", children, ...rest }: Props) {
  const base =
    "inline-flex items-center justify-center font-sans font-semibold tracking-[-0.005em] " +
    "transition-[transform,background-color,color,border-color] duration-200 " +
    "active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 " +
    "focus-visible:ring-[var(--color-persimmon)] focus-visible:ring-offset-2 " +
    "focus-visible:ring-offset-[var(--color-paper)] whitespace-nowrap";
  const sizing =
    size === "lg"
      ? "h-11 px-6 text-[14.5px] rounded-full"
      : "h-8 px-4 text-[13px] rounded-full";
  const variant =
    tone === "primary"
      ? "bg-[var(--color-persimmon)] text-white hover:bg-[var(--color-persimmon-deep)]"
      : tone === "ghost-light"
      ? "bg-transparent text-white/95 border border-white/30 hover:border-white"
      : "bg-transparent text-[var(--color-ink)] border border-[var(--color-border)] hover:border-[var(--color-ink)]";
  return (
    <Link
      {...rest}
      className={`${base} ${sizing} ${variant} ${className}`}
      style={{ transitionTimingFunction: "var(--ease-soft)" }}
    >
      {children}
    </Link>
  );
}
