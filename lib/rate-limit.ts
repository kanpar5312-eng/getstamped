/**
 * In-memory sliding-window rate limiter.
 *
 * Per-instance only — if you scale to multiple Vercel regions you'll want
 * Upstash / Redis for shared state. For a single-region Next app on Vercel
 * this is plenty and costs nothing.
 *
 * Mac-safe: no setInterval, no background workers. Stale entries are pruned
 * lazily on the same lookup that creates them.
 */

type Bucket = { hits: number[] };
const buckets = new Map<string, Bucket>();

// Hard cap so a misbehaving IP space can't OOM the Map. We evict the oldest
// half of entries when we hit the cap.
const MAX_BUCKETS = 5000;

export type RateLimit = {
  /** Window size in milliseconds. */
  windowMs: number;
  /** Max requests per window. */
  max: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
};

export function rateLimit(key: string, limit: RateLimit): RateLimitResult {
  const now = Date.now();
  const windowStart = now - limit.windowMs;

  let bucket = buckets.get(key);
  if (!bucket) {
    if (buckets.size >= MAX_BUCKETS) {
      // Evict oldest half
      const drop = Array.from(buckets.keys()).slice(0, Math.floor(MAX_BUCKETS / 2));
      drop.forEach((k) => buckets.delete(k));
    }
    bucket = { hits: [] };
    buckets.set(key, bucket);
  }

  // Drop hits outside the window
  while (bucket.hits.length && bucket.hits[0] < windowStart) bucket.hits.shift();

  if (bucket.hits.length >= limit.max) {
    const oldest = bucket.hits[0];
    const resetMs = Math.max(0, oldest + limit.windowMs - now);
    return {
      allowed: false,
      remaining: 0,
      resetSeconds: Math.ceil(resetMs / 1000),
    };
  }

  bucket.hits.push(now);
  return {
    allowed: true,
    remaining: limit.max - bucket.hits.length,
    resetSeconds: Math.ceil(limit.windowMs / 1000),
  };
}

/**
 * Per-path limits. Lookup is prefix-based — most specific match wins.
 * Tune these as you observe real traffic.
 */
export const LIMITS: { prefix: string; limit: RateLimit }[] = [
  // Expensive PDF generation
  { prefix: "/api/documents/interview-pdf", limit: { windowMs: 60_000, max: 5 } },
  // AI scoring — paywalled, but still expensive
  { prefix: "/api/mock-interview",          limit: { windowMs: 60_000, max: 20 } },
  // AI Q&A — quota-gated per user, this catches anon abuse
  { prefix: "/api/ask",                      limit: { windowMs: 60_000, max: 30 } },
  // Auth POST endpoints (server actions hit these as POSTs)
  { prefix: "/sign-up",                      limit: { windowMs: 60_000, max: 10 } },
  { prefix: "/sign-in",                      limit: { windowMs: 60_000, max: 20 } },
  { prefix: "/forgot-password",              limit: { windowMs: 60_000, max: 5 } },
  // Generic API catch-all
  { prefix: "/api",                          limit: { windowMs: 60_000, max: 60 } },
];

export function findLimit(path: string): RateLimit | null {
  for (const entry of LIMITS) {
    if (path.startsWith(entry.prefix)) return entry.limit;
  }
  return null;
}
