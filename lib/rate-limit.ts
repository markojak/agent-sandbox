export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
};

type Bucket = {
  windowStartMs: number;
  count: number;
};

export class InMemoryRateLimiter {
  private readonly buckets = new Map<string, Bucket>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {}

  consume(key: string, nowMs = Date.now()): RateLimitResult {
    const existing = this.buckets.get(key);

    if (!existing || nowMs - existing.windowStartMs >= this.windowMs) {
      const resetAt = nowMs + this.windowMs;
      this.buckets.set(key, { windowStartMs: nowMs, count: 1 });

      return {
        allowed: true,
        limit: this.limit,
        remaining: this.limit - 1,
        resetAt,
      };
    }

    existing.count += 1;

    const remaining = Math.max(this.limit - existing.count, 0);
    const resetAt = existing.windowStartMs + this.windowMs;

    return {
      allowed: existing.count <= this.limit,
      limit: this.limit,
      remaining,
      resetAt,
    };
  }
}
