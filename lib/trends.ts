import type { DailyTotal, FoodEntry } from "@/lib/calorie-types";

const trendCache = new Map<string, { expiresAt: number; data: DailyTotal[] }>();

export function getDateKey(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function toUtcDateFromKey(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00.000Z`);
}

function shiftDateKey(dateKey: string, offsetDays: number): string {
  const date = toUtcDateFromKey(dateKey);
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function resolveDateKey(value: Date | string, timezone: string): string {
  return typeof value === "string" ? value : getDateKey(value, timezone);
}

export function formatReadableDate(dateKey: string, timezone: string): string {
  void timezone;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
  }).format(toUtcDateFromKey(dateKey));
}

function listDateKeys(windowDays: number, endDateKey: string): string[] {
  const keys: string[] = [];

  for (let i = windowDays - 1; i >= 0; i -= 1) {
    keys.push(shiftDateKey(endDateKey, -i));
  }

  return keys;
}

function buildEntriesFingerprint(entries: FoodEntry[]): string {
  return entries
    .map((entry) => `${entry.id}:${entry.consumedAt}:${entry.calories}:${entry.mealName}`)
    .sort()
    .join("|");
}

function buildCacheKey(entries: FoodEntry[], windowDays: number, endDateKey: string, timezone: string): string {
  return `${windowDays}:${endDateKey}:${timezone}:${buildEntriesFingerprint(entries)}`;
}

export function aggregateDailyTotals(entries: FoodEntry[], timezone: string): Map<string, DailyTotal> {
  const totalsByDate = new Map<string, DailyTotal>();

  for (const entry of entries) {
    const dateKey = getDateKey(new Date(entry.consumedAt), timezone);
    const existing = totalsByDate.get(dateKey);

    if (!existing) {
      totalsByDate.set(dateKey, {
        date: dateKey,
        totalCalories: entry.calories,
        entryCount: 1,
      });
      continue;
    }

    totalsByDate.set(dateKey, {
      ...existing,
      totalCalories: existing.totalCalories + entry.calories,
      entryCount: existing.entryCount + 1,
    });
  }

  return totalsByDate;
}

export function buildTrendSeries(
  entries: FoodEntry[],
  timezone: string,
  windowDays: 7 | 30,
  endDate: Date | string = new Date(),
): DailyTotal[] {
  const endDateKey = resolveDateKey(endDate, timezone);
  const cacheKey = buildCacheKey(entries, windowDays, endDateKey, timezone);
  const cached = trendCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const totalsByDate = aggregateDailyTotals(entries, timezone);
  const timeline = listDateKeys(windowDays, endDateKey).map((date) => {
    const existing = totalsByDate.get(date);
    return (
      existing ?? {
        date,
        totalCalories: 0,
        entryCount: 0,
      }
    );
  });

  trendCache.set(cacheKey, {
    expiresAt: Date.now() + 60_000,
    data: timeline,
  });

  return timeline;
}

export function clearTrendCache() {
  trendCache.clear();
}
