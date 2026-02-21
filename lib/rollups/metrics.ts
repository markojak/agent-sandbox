import { addDays, eachDate } from "./date";
import type { DailyRollup, DateKey, InsightsMetrics, StreakMetrics, WeeklyAdherence } from "./types";

function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

function rollupMap(rollups: DailyRollup[]): Map<DateKey, DailyRollup> {
  return new Map(rollups.map((rollup) => [rollup.date, rollup]));
}

export function computeWeeklyAdherence(
  rollups: DailyRollup[],
  goalCalories: number,
  asOfDate: DateKey,
): WeeklyAdherence {
  const windowDays = 7;
  const start = addDays(asOfDate, -(windowDays - 1));
  const byDate = rollupMap(rollups);
  const tolerance = goalCalories * 0.1;

  let successfulDays = 0;

  for (const date of eachDate(start, asOfDate)) {
    const totalCalories = byDate.get(date)?.totalCalories ?? 0;
    const withinTarget = Math.abs(totalCalories - goalCalories) <= tolerance;

    if (withinTarget) {
      successfulDays += 1;
    }
  }

  return {
    scorePercent: roundToTwo((successfulDays / windowDays) * 100),
    successfulDays,
    windowDays,
  };
}

export function computeRollingAverageCalories(
  rollups: DailyRollup[],
  asOfDate: DateKey,
  windowDays = 7,
): number {
  const start = addDays(asOfDate, -(windowDays - 1));
  const byDate = rollupMap(rollups);

  let total = 0;

  for (const date of eachDate(start, asOfDate)) {
    total += byDate.get(date)?.totalCalories ?? 0;
  }

  return roundToTwo(total / windowDays);
}

export function computeStreaks(rollups: DailyRollup[], asOfDate: DateKey): StreakMetrics {
  if (rollups.length === 0) {
    return {
      currentStreakDays: 0,
      longestStreakDays: 0,
    };
  }

  const ordered = [...rollups].sort((a, b) => a.date.localeCompare(b.date));

  let longest = 0;
  let currentRun = 0;

  for (const rollup of ordered) {
    if (rollup.hasLogs) {
      currentRun += 1;
      longest = Math.max(longest, currentRun);
    } else {
      currentRun = 0;
    }
  }

  const byDate = rollupMap(ordered);
  let currentStreakDays = 0;
  let cursor = asOfDate;

  while (byDate.get(cursor)?.hasLogs) {
    currentStreakDays += 1;
    cursor = addDays(cursor, -1);
  }

  return {
    currentStreakDays,
    longestStreakDays: longest,
  };
}

export function computeInsightsMetrics(
  rollups: DailyRollup[],
  goalCalories: number,
  asOfDate: DateKey,
): InsightsMetrics {
  return {
    asOfDate,
    rollingAverageCalories7d: computeRollingAverageCalories(rollups, asOfDate, 7),
    weeklyAdherence: computeWeeklyAdherence(rollups, goalCalories, asOfDate),
    streaks: computeStreaks(rollups, asOfDate),
  };
}
