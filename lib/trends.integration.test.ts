import { beforeEach, describe, expect, it } from "vitest";

import { persistedEntries } from "@/lib/calorie-data";
import { getDailySummary } from "@/lib/daily-summary";
import { aggregateDailyTotals, buildTrendSeries, clearTrendCache, formatReadableDate } from "@/lib/trends";

describe("daily totals + trend integration", () => {
  beforeEach(() => {
    clearTrendCache();
  });

  it("calculates daily totals from persisted entries", () => {
    const summary = getDailySummary(persistedEntries, "UTC", new Date("2026-03-08T12:00:00.000Z"), 2200);

    expect(summary.totalCalories).toBe(1150);
    expect(summary.remaining).toBe(1050);
    expect(summary.overGoal).toBe(0);
  });

  it("fills missing days for sparse trend windows", () => {
    const trend = buildTrendSeries(persistedEntries, "UTC", 7, "2026-03-10");

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

  it("keeps selected-day labels stable for positive-offset timezones", () => {
    const plus14Entries = [
      { id: "a", consumedAt: "2026-03-09T10:30:00.000Z", calories: 300, mealName: "late snack" },
      { id: "b", consumedAt: "2026-03-10T08:00:00.000Z", calories: 500, mealName: "dinner" },
    ];

    const summary = getDailySummary(plus14Entries, "Pacific/Kiritimati", "2026-03-10", 2200);
    const trend = buildTrendSeries(plus14Entries, "Pacific/Kiritimati", 7, "2026-03-10");

    expect(summary.dateKey).toBe("2026-03-10");
    expect(summary.totalCalories).toBe(800);
    expect(trend.at(-1)).toMatchObject({ date: "2026-03-10", totalCalories: 800, entryCount: 2 });
    expect(formatReadableDate("2026-03-10", "Pacific/Kiritimati")).toBe("Mar 10");
  });

  it("invalidates cache when entries change without length changes", () => {
    const endDate = "2026-03-10";
    const firstEntries = [{ id: "a", consumedAt: "2026-03-10T12:00:00.000Z", calories: 200, mealName: "meal" }];
    const editedEntries = [{ id: "a", consumedAt: "2026-03-10T12:00:00.000Z", calories: 400, mealName: "meal" }];

    const initial = buildTrendSeries(firstEntries, "UTC", 7, endDate);
    const updated = buildTrendSeries(editedEntries, "UTC", 7, endDate);

    expect(initial.at(-1)?.totalCalories).toBe(200);
    expect(updated.at(-1)?.totalCalories).toBe(400);
  });
});
