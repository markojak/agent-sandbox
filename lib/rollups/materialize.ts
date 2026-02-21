import { addDays, eachDate, maxDate, minDate, toDateKey } from "./date";
import { computeInsightsMetrics } from "./metrics";
import type {
  DailyRollup,
  DateKey,
  FoodEntry,
  MaterializeRollupsParams,
  MaterializeRollupsResult,
} from "./types";

function indexRollups(rollups: DailyRollup[]): Map<DateKey, DailyRollup> {
  return new Map(rollups.map((rollup) => [rollup.date, rollup]));
}

function aggregateTotalsByDate(entries: FoodEntry[], timeZone: string): Map<DateKey, { totalCalories: number; entryCount: number }> {
  const totals = new Map<DateKey, { totalCalories: number; entryCount: number }>();

  for (const entry of entries) {
    const date = toDateKey(entry.consumedAt, timeZone);
    const current = totals.get(date) ?? { totalCalories: 0, entryCount: 0 };

    totals.set(date, {
      totalCalories: current.totalCalories + entry.calories,
      entryCount: current.entryCount + 1,
    });
  }

  return totals;
}

function computeRecomputeRange(
  startDate: DateKey,
  endDate: DateKey,
  changedEntryDates: DateKey[] | undefined,
): { startDate: DateKey; endDate: DateKey } {
  if (!changedEntryDates?.length) {
    return { startDate, endDate };
  }

  let changedStart = changedEntryDates[0];
  let changedEnd = addDays(changedEntryDates[0], 6);

  for (const date of changedEntryDates.slice(1)) {
    changedStart = minDate(changedStart, date);
    changedEnd = maxDate(changedEnd, addDays(date, 6));
  }

  return {
    startDate: minDate(startDate, changedStart),
    endDate: maxDate(endDate, changedEnd),
  };
}

export function materializeDailyRollups(params: MaterializeRollupsParams): MaterializeRollupsResult {
  const { userId, profile, entries, existingRollups = [], startDate, endDate, changedEntryDates } = params;

  const recomputedRange = computeRecomputeRange(startDate, endDate, changedEntryDates);
  const totalsByDate = aggregateTotalsByDate(entries, profile.timeZone);
  const existingByDate = indexRollups(existingRollups.filter((rollup) => rollup.userId === userId));

  const recomputeDates = eachDate(recomputedRange.startDate, recomputedRange.endDate);
  const now = new Date().toISOString();

  for (const date of recomputeDates) {
    const totals = totalsByDate.get(date) ?? { totalCalories: 0, entryCount: 0 };

    existingByDate.set(date, {
      userId,
      date,
      totalCalories: totals.totalCalories,
      entryCount: totals.entryCount,
      hasLogs: totals.entryCount > 0,
      updatedAt: now,
    });
  }

  const rollups = [...existingByDate.values()].sort((a, b) => a.date.localeCompare(b.date));

  return {
    rollups,
    insights: computeInsightsMetrics(rollups, profile.dailyCalorieGoal, recomputedRange.endDate),
    recomputedRange,
  };
}
