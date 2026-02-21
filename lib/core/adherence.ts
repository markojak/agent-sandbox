import { dayKey } from "@/lib/core/metrics";

export function calculateAdherenceScore(
  dailyTotals: Record<string, number>,
  goalCalories: number,
  tolerancePercent = 0.1,
): number {
  const values = Object.values(dailyTotals);
  if (values.length === 0) {
    return 0;
  }

  const low = goalCalories * (1 - tolerancePercent);
  const high = goalCalories * (1 + tolerancePercent);
  const onTarget = values.filter((value) => value >= low && value <= high).length;
  return Number((onTarget / values.length).toFixed(2));
}

export function calculateLoggingStreak(loggedDates: string[], endDate: string): number {
  const unique = new Set(loggedDates.map((date) => dayKey(date)));
  const cursor = new Date(endDate);

  let streak = 0;
  while (unique.has(dayKey(cursor))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return streak;
}
