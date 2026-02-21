import assert from "node:assert/strict";
import test from "node:test";
import { InMemoryRateLimiter } from "@/lib/rate-limit";

test("allows requests within the configured limit", () => {
  const limiter = new InMemoryRateLimiter(2, 1_000);

  const first = limiter.consume("ip-1", 1_000);
  const second = limiter.consume("ip-1", 1_100);

  assert.equal(first.allowed, true);
  assert.equal(second.allowed, true);
  assert.equal(second.remaining, 0);
});

test("blocks requests above the limit in the same window", () => {
  const limiter = new InMemoryRateLimiter(2, 1_000);

  limiter.consume("ip-1", 1_000);
  limiter.consume("ip-1", 1_100);
  const third = limiter.consume("ip-1", 1_200);

  assert.equal(third.allowed, false);
  assert.equal(third.remaining, 0);
});

test("resets counters after the window elapses", () => {
  const limiter = new InMemoryRateLimiter(1, 1_000);

  limiter.consume("ip-1", 1_000);
  const second = limiter.consume("ip-1", 2_001);

  assert.equal(second.allowed, true);
  assert.equal(second.remaining, 0);
});
