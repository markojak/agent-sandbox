import { describe, expect, it } from "vitest";
import { persistedEntries } from "@/lib/calorie-data";
import { getDailySummary } from "@/lib/daily-summary";
import { aggregateDailyTotals, buildTrendSeries } from "@/lib/trends";

describe("daily totals + trend integration", () => {
  it("calculates daily totals from persisted entries", () => {
    const summary = getDailySummary(persistedEntries, "UTC", new Date("2026-03-08T12:00:00.000Z"), 2200);

    expect(summary.totalCalories).toBe(1150);
    expect(summary.remaining).toBe(1050);
    expect(summary.overGoal).toBe(0);
  });

  it("fills missing days for sparse trend windows", () => {
    const trend = buildTrendSeries(persistedEntries, "UTC", 7, new Date("2026-03-10T12:00:00.000Z"));

    expect(trend).toHaveLength(7);
    expect(trend[0]).toMatchObject({ date: "2026-03-04", totalCalories: 0, entryCount: 0 });
    expect(trend[4]).toMatchObject({ date: "2026-03-08", totalCalories: 1150, entryCount: 2 });
    expect(trend[5]).toMatchObject({ date: "2026-03-09", totalCalories: 320, entryCount: 1 });
    expect(trend[6]).toMatchObject({ date: "2026-03-10", totalCalories: 510, entryCount: 1 });
  });

  it("is timezone-aware around DST transitions", () => {
    const dstEntries = [
      { id: "a", consumedAt: "2026-03-08T05:30:00.000Z", calories: 450, mealName: "late meal" },
      { id: "b", consumedAt: "2026-03-08T08:30:00.000Z", calories: 500, mealName: "early meal" },
    ];

    const totals = aggregateDailyTotals(dstEntries, "America/Chicago");

    expect(totals.get("2026-03-07")?.totalCalories).toBe(450);
    expect(totals.get("2026-03-08")?.totalCalories).toBe(500);
  });
});
