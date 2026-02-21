import { describe, expect, it } from "vitest";

import { computeRollingAverageCalories, computeStreaks, computeWeeklyAdherence } from "../metrics";
import type { DailyRollup } from "../types";

const userId = "user-1";

function rollup(date: string, totalCalories: number): DailyRollup {
  return {
    userId,
    date: date as `${number}-${number}-${number}`,
    totalCalories,
    entryCount: totalCalories > 0 ? 1 : 0,
    hasLogs: totalCalories > 0,
    updatedAt: "2026-02-21T00:00:00.000Z",
  };
}

describe("metrics", () => {
  it("computes weekly adherence and rolling average", () => {
    const rollups: DailyRollup[] = [
      rollup("2026-02-15", 2000),
      rollup("2026-02-16", 1980),
      rollup("2026-02-17", 2200),
      rollup("2026-02-18", 2100),
      rollup("2026-02-19", 1700),
      rollup("2026-02-20", 2005),
      rollup("2026-02-21", 1995),
    ];

    const adherence = computeWeeklyAdherence(rollups, 2000, "2026-02-21");
    const rollingAverage = computeRollingAverageCalories(rollups, "2026-02-21", 7);

    expect(adherence.successfulDays).toBe(6);
    expect(adherence.scorePercent).toBeCloseTo(85.71, 2);
    expect(rollingAverage).toBe(1997.14);
  });

  it("handles streak edge cases around zero-log days", () => {
    const rollups: DailyRollup[] = [
      rollup("2026-02-15", 100),
      rollup("2026-02-16", 200),
      rollup("2026-02-17", 0),
      rollup("2026-02-18", 50),
      rollup("2026-02-19", 60),
      rollup("2026-02-20", 70),
      rollup("2026-02-21", 0),
    ];

    const streaks = computeStreaks(rollups, "2026-02-21");
    expect(streaks.currentStreakDays).toBe(0);
    expect(streaks.longestStreakDays).toBe(3);
  });
});
