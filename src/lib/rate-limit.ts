/**
 * Sliding-window in-memory rate limiter for auth endpoints.
 * Note: In multi-instance serverless deployments each instance maintains its own window;
 * pair with edge/WAF rate limiting for distributed enforcement.
 */

interface BucketEntry {
  timestamps: number[];
}

const store = new Map<string, BucketEntry>();
const MAX_ENTRIES = 5000;

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
  now = Date.now()
): RateLimitResult {
  const cutoff = now - windowMs;
  const entry = store.get(key);
  const recent = entry ? entry.timestamps.filter((ts) => ts > cutoff) : [];

  if (recent.length >= maxRequests) {
    const oldest = recent[0];
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    store.set(key, { timestamps: recent });
    return { allowed: false, retryAfterSeconds };
  }

  recent.push(now);
  if (store.size >= MAX_ENTRIES && !store.has(key)) {
    const firstKey = store.keys().next().value;
    if (firstKey !== undefined) store.delete(firstKey);
  }
  store.set(key, { timestamps: recent });
  return { allowed: true, retryAfterSeconds: 0 };
}

export function resetRateLimitStore(): void {
  store.clear();
}
