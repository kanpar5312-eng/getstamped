import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

/**
 * Eyebrow label per spec — text-[10px] uppercase tracking-[0.18em] muted.
 */
export function Eyebrow({ children, className = "" }: Props) {
  return (
    <span
      className={
        "text-[10px] uppercase tracking-[0.18em] font-medium " +
        "text-[var(--color-muted)] " +
        className
      }
    >
      {children}
    </span>
  );
}
