import type { DailyTotal, FoodEntry } from "@/lib/calorie-types";

const DAY = 24 * 60 * 60 * 1000;
const trendCache = new Map<string, { expiresAt: number; data: DailyTotal[] }>();

export function getDateKey(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatReadableDate(dateKey: string, timezone: string): string {
  const date = new Date(`${dateKey}T12:00:00.000Z`);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    month: "short",
    day: "numeric",
  }).format(date);
}

function listDateKeys(windowDays: number, endDate: Date, timezone: string): string[] {
  const keys: string[] = [];

  for (let i = windowDays - 1; i >= 0; i -= 1) {
    keys.push(getDateKey(new Date(endDate.getTime() - i * DAY), timezone));
  }

  return keys;
}

function buildCacheKey(entries: FoodEntry[], windowDays: number, endDate: Date, timezone: string): string {
  return `${entries.length}:${windowDays}:${getDateKey(endDate, timezone)}:${timezone}`;
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
  endDate = new Date(),
): DailyTotal[] {
  const cacheKey = buildCacheKey(entries, windowDays, endDate, timezone);
  const cached = trendCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const totalsByDate = aggregateDailyTotals(entries, timezone);
  const timeline = listDateKeys(windowDays, endDate, timezone).map((date) => {
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
