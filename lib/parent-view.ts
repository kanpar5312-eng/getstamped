/**
 * Mock parent-view tokens. Replaced with Supabase parent_view_tokens once wired.
 */

import { computeDashboard } from "@/lib/dashboard-state";
import { getMock } from "@/lib/mock-user";

export type ParentToken = {
  token: string;
  userId: string;
  enabled: boolean;
  views: number;
  lastViewedAt: Date | null;
};

const TOKENS: Record<string, ParentToken> = {
  arya123: {
    token: "arya123",
    userId: "u-b",
    enabled: true,
    views: 12,
    lastViewedAt: new Date("2026-06-05T09:30:00Z"),
  },
};

export function getTokenForUser(): ParentToken {
  return TOKENS["arya123"];
}

export function resolveToken(token: string): {
  ok: true;
  user: ReturnType<typeof getMock>;
  dashboard: ReturnType<typeof computeDashboard>;
} | { ok: false } {
  const t = TOKENS[token];
  if (!t || !t.enabled) return { ok: false };
  const mock = getMock("B");
  const dashboard = computeDashboard(mock.profile, mock.progress);
  return { ok: true, user: mock, dashboard };
}
