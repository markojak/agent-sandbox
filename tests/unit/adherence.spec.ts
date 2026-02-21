import { describe, expect, it } from "vitest";

import { calculateAdherenceScore, calculateLoggingStreak } from "@/lib/core/adherence";

describe("adherence and streak calculations", () => {
  it("calculates adherence score within tolerance", () => {
    const score = calculateAdherenceScore(
      {
        "2026-02-18": 1900,
        "2026-02-19": 2050,
        "2026-02-20": 2500,
      },
      2000,
    );

    expect(score).toBe(0.67);
  });

  it("returns zero adherence for empty data", () => {
    expect(calculateAdherenceScore({}, 2000)).toBe(0);
  });

  it("calculates streak ending on endDate", () => {
    const streak = calculateLoggingStreak(
      ["2026-02-19", "2026-02-20", "2026-02-21", "2026-02-10"],
      "2026-02-21T23:59:59.000Z",
    );

    expect(streak).toBe(3);
  });
});
