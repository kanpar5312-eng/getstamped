import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "small";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

const base =
  "inline-flex items-center justify-center gap-2 font-medium tracking-tight " +
  "transition-[background-color,border-color,color,transform] duration-150 ease-out " +
  "active:scale-[0.97] " +
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-persimmon)]/12 " +
  "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 select-none";

const variants: Record<Variant, string> = {
  primary:
    "rounded-lg px-5 py-2.5 text-sm bg-[var(--color-persimmon)] text-[var(--color-paper-soft)] " +
    "hover:bg-[var(--color-persimmon-deep)]",
  secondary:
    "rounded-lg px-5 py-2.5 text-sm border border-[var(--color-border)] " +
    "bg-transparent text-[var(--color-ink)] " +
    "hover:border-[var(--color-persimmon)] hover:text-[var(--color-persimmon-deep)]",
  ghost:
    "rounded-lg px-4 py-2 text-sm text-[var(--color-ink-soft)] " +
    "hover:bg-[var(--color-paper-deep)]",
  small:
    "rounded-md px-4 py-1.5 text-xs bg-[var(--color-persimmon)] text-[var(--color-paper-soft)] " +
    "hover:bg-[var(--color-persimmon-deep)]",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", className = "", children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`${base} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
});
