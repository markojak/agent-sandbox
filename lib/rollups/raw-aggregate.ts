import { toDateKey } from "./date";
import type { DateKey, FoodEntry } from "./types";

export function aggregateEntriesLikeSql(entries: FoodEntry[], timeZone: string): Map<DateKey, number> {
  const totals = new Map<DateKey, number>();

  for (const entry of entries) {
    const date = toDateKey(entry.consumedAt, timeZone);
    totals.set(date, (totals.get(date) ?? 0) + entry.calories);
  }

  return totals;
}
