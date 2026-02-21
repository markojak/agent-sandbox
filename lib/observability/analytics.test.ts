import { beforeEach, describe, expect, it, vi } from "vitest";

import { clearAnalyticsDedupeCache, trackAnalyticsEvent } from "@/lib/observability/analytics";

describe("trackAnalyticsEvent", () => {
  beforeEach(() => {
    clearAnalyticsDedupeCache();
  });

  it("emits once per dedupe key", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => undefined);

    const first = trackAnalyticsEvent({
      event: "log_entry_create",
      requestId: "req-1",
      userIdHash: "user-1",
      dedupeKey: "k1",
    });

    const second = trackAnalyticsEvent({
      event: "log_entry_create",
      requestId: "req-1",
      userIdHash: "user-1",
      dedupeKey: "k1",
    });

    expect(first).toBe(true);
    expect(second).toBe(false);
    expect(spy).toHaveBeenCalledTimes(2);

    spy.mockRestore();
  });
});
