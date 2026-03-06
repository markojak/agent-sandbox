import type { DateKey } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

export function toDateKey(isoTimestamp: string, timeZone: string): DateKey {
  const date = new Date(isoTimestamp);

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(date) as DateKey;
}

export function addDays(dateKey: DateKey, days: number): DateKey {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10) as DateKey;
}

export function eachDate(startDate: DateKey, endDate: DateKey): DateKey[] {
  const start = new Date(`${startDate}T00:00:00.000Z`).getTime();
  const end = new Date(`${endDate}T00:00:00.000Z`).getTime();

  if (end < start) {
    return [];
  }

  const days = Math.floor((end - start) / DAY_MS);
  return Array.from({ length: days + 1 }, (_, index) => addDays(startDate, index));
}

export function minDate(a: DateKey, b: DateKey): DateKey {
  return a <= b ? a : b;
}

export function maxDate(a: DateKey, b: DateKey): DateKey {
  return a >= b ? a : b;
}
