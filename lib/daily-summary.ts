import type { FoodEntry } from "@/lib/calorie-types";
import { aggregateDailyTotals, getDateKey } from "@/lib/trends";

export function getDailySummary(entries: FoodEntry[], timezone: string, selectedDate: Date | string, calorieGoal: number) {
  const dateKey = typeof selectedDate === "string" ? selectedDate : getDateKey(selectedDate, timezone);
  const totals = aggregateDailyTotals(entries, timezone).get(dateKey);
  const totalCalories = totals?.totalCalories ?? 0;
  const delta = calorieGoal - totalCalories;

  return {
    dateKey,
    totalCalories,
    entryCount: totals?.entryCount ?? 0,
    calorieGoal,
    remaining: delta > 0 ? delta : 0,
    overGoal: delta < 0 ? Math.abs(delta) : 0,
    isOverGoal: delta < 0,
  };
}
