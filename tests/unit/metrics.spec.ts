import { describe, expect, it } from "vitest";

import { buildDailyTotals, calculateDailyTotal, calculateRollingAverage } from "@/lib/core/metrics";
import { sampleEntries } from "@/tests/fixtures/entries";

describe("metric calculations", () => {
  it("calculates daily totals", () => {
    expect(calculateDailyTotal(sampleEntries, "2026-02-20T23:59:59.000Z")).toBe(900);
  });

  it("builds day-indexed totals", () => {
    expect(buildDailyTotals(sampleEntries)).toMatchObject({
      "2026-02-18": 300,
      "2026-02-19": 700,
      "2026-02-20": 900,
      "2026-02-21": 500,
    });
  });

  it("calculates rolling average over fixed window", () => {
    const dailyTotals = buildDailyTotals(sampleEntries);
    const average = calculateRollingAverage(dailyTotals, 4, "2026-02-21T00:00:00.000Z");
    expect(average).toBe(600);
  });
});
