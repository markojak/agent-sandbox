import { describe, expect, it } from "vitest";

import { materializeDailyRollups } from "../materialize";
import { aggregateEntriesLikeSql } from "../raw-aggregate";
import type { DailyRollup, FoodEntry, UserProfile } from "../types";

const profile: UserProfile = {
  userId: "user-1",
  dailyCalorieGoal: 2000,
  timeZone: "UTC",
};

const entries: FoodEntry[] = [
  { id: "1", userId: "user-1", calories: 500, consumedAt: "2026-02-15T08:00:00.000Z" },
  { id: "2", userId: "user-1", calories: 1400, consumedAt: "2026-02-15T18:00:00.000Z" },
  { id: "3", userId: "user-1", calories: 1800, consumedAt: "2026-02-16T18:00:00.000Z" },
  { id: "4", userId: "user-1", calories: 2100, consumedAt: "2026-02-18T18:00:00.000Z" },
];

describe("materializeDailyRollups", () => {
  it("is idempotent when rerun with prior rollups", () => {
    const firstRun = materializeDailyRollups({
      userId: "user-1",
      profile,
      entries,
      startDate: "2026-02-15",
      endDate: "2026-02-21",
    });

    const secondRun = materializeDailyRollups({
      userId: "user-1",
      profile,
      entries,
      existingRollups: firstRun.rollups,
      startDate: "2026-02-15",
      endDate: "2026-02-21",
    });

    const stableFirst = stripUpdatedAt(firstRun.rollups);
    const stableSecond = stripUpdatedAt(secondRun.rollups);

    expect(stableSecond).toEqual(stableFirst);
  });

  it("recomputes affected dates for late historical edits", () => {
    const firstRun = materializeDailyRollups({
      userId: "user-1",
      profile,
      entries,
      startDate: "2026-02-15",
      endDate: "2026-02-21",
    });

    const withLateEntry = [
      ...entries,
      { id: "5", userId: "user-1", calories: 400, consumedAt: "2026-02-16T03:00:00.000Z" },
    ];

    const recompute = materializeDailyRollups({
      userId: "user-1",
      profile,
      entries: withLateEntry,
      existingRollups: firstRun.rollups,
      startDate: "2026-02-15",
      endDate: "2026-02-21",
      changedEntryDates: ["2026-02-16"],
    });

    expect(recompute.recomputedRange.startDate).toBe("2026-02-15");
    expect(recompute.recomputedRange.endDate).toBe("2026-02-22");

    const updatedDay = recompute.rollups.find((item) => item.date === "2026-02-16");
    expect(updatedDay?.totalCalories).toBe(2200);
  });

  it("ignores entries from other users when materializing a user partition", () => {
    const mixedEntries: FoodEntry[] = [
      ...entries,
      { id: "foreign-1", userId: "user-2", calories: 5000, consumedAt: "2026-02-15T12:00:00.000Z" },
      { id: "foreign-2", userId: "user-2", calories: 6000, consumedAt: "2026-02-16T12:00:00.000Z" },
    ];

    const result = materializeDailyRollups({
      userId: "user-1",
      profile,
      entries: mixedEntries,
      startDate: "2026-02-15",
      endDate: "2026-02-21",
    });

    const dayOne = result.rollups.find((item) => item.date === "2026-02-15");
    const dayTwo = result.rollups.find((item) => item.date === "2026-02-16");

    expect(dayOne?.totalCalories).toBe(1900);
    expect(dayTwo?.totalCalories).toBe(1800);
  });

  it("meets MVP latency target for rollup materialization on expected dataset", () => {
    const sampleEntries: FoodEntry[] = [];

    for (let day = 0; day < 30; day += 1) {
      for (let index = 0; index < 8; index += 1) {
        sampleEntries.push({
          id: `entry-${day}-${index}`,
          userId: "user-1",
          calories: 300 + ((day + index) % 7) * 50,
          consumedAt: `2026-01-${String(day + 1).padStart(2, "0")}T12:00:00.000Z`,
        });
      }
    }

    const started = performance.now();
    materializeDailyRollups({
      userId: "user-1",
      profile,
      entries: sampleEntries,
      startDate: "2026-01-01",
      endDate: "2026-01-30",
    });
    const elapsedMs = performance.now() - started;

    expect(elapsedMs).toBeLessThan(100);
  });

  it("matches raw entry aggregate totals per user-date", () => {
    const result = materializeDailyRollups({
      userId: "user-1",
      profile,
      entries,
      startDate: "2026-02-15",
      endDate: "2026-02-21",
    });

    const rawAggregate = aggregateEntriesLikeSql(entries, "UTC");

    for (const [date, total] of rawAggregate.entries()) {
      const rollup = result.rollups.find((item) => item.date === date);
      expect(rollup?.totalCalories).toBe(total);
    }
  });
});

function stripUpdatedAt(rollups: DailyRollup[]) {
  return rollups.map((rollup) => ({
    userId: rollup.userId,
    date: rollup.date,
    totalCalories: rollup.totalCalories,
    entryCount: rollup.entryCount,
    hasLogs: rollup.hasLogs,
  }));
}
