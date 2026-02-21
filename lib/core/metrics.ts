export type CalorieEntry = {
  calories: number;
  consumedAt: string;
};

export function dayKey(dateInput: string | Date): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return date.toISOString().slice(0, 10);
}

export function calculateDailyTotal(entries: CalorieEntry[], date: string): number {
  const targetDay = dayKey(date);
  return entries
    .filter((entry) => dayKey(entry.consumedAt) === targetDay)
    .reduce((sum, entry) => sum + entry.calories, 0);
}

export function buildDailyTotals(entries: CalorieEntry[]): Record<string, number> {
  return entries.reduce<Record<string, number>>((acc, entry) => {
    const key = dayKey(entry.consumedAt);
    acc[key] = (acc[key] ?? 0) + entry.calories;
    return acc;
  }, {});
}

export function calculateRollingAverage(dailyTotals: Record<string, number>, days: number, endDate: string): number {
  const end = new Date(endDate);
  let sum = 0;

  for (let i = 0; i < days; i += 1) {
    const cursor = new Date(end);
    cursor.setUTCDate(end.getUTCDate() - i);
    sum += dailyTotals[dayKey(cursor)] ?? 0;
  }

  return Number((sum / days).toFixed(2));
}
