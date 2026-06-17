import type { ReactNode } from "react";

export function HorizonHeader({ children }: { children: ReactNode }) {
  return (
    <div className="horizon-header relative">
      <span className="horizon-monolith horizon-monolith-left" aria-hidden />
      <span className="horizon-monolith horizon-monolith-right" aria-hidden />
      <span className="horizon-sun" aria-hidden />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
