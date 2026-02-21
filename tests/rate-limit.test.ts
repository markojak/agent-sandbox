import { describe, expect, it } from "vitest";

import { InMemoryRateLimiter } from "@/lib/rate-limit";

describe("in-memory rate limiter", () => {
  it("allows requests within the configured limit", () => {
    const limiter = new InMemoryRateLimiter(2, 1_000);

    const first = limiter.consume("ip-1", 1_000);
    const second = limiter.consume("ip-1", 1_100);

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(0);
  });

  it("blocks requests above the limit in the same window", () => {
    const limiter = new InMemoryRateLimiter(2, 1_000);

    limiter.consume("ip-1", 1_000);
    limiter.consume("ip-1", 1_100);
    const third = limiter.consume("ip-1", 1_200);

    expect(third.allowed).toBe(false);
    expect(third.remaining).toBe(0);
  });

  it("resets counters after the window elapses", () => {
    const limiter = new InMemoryRateLimiter(1, 1_000);

    limiter.consume("ip-1", 1_000);
    const second = limiter.consume("ip-1", 2_001);

    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(0);
  });
});
