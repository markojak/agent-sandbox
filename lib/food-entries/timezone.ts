function getOffsetAt(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);

  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  const utcTime = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second)
  );

  return utcTime - date.getTime();
}

export function zonedDateTimeToUtc(localDateTime: string, timeZone: string): Date {
  const [datePart, timePart = "00:00"] = localDateTime.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);

  const naive = new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0));
  const offset = getOffsetAt(naive, timeZone);

  return new Date(naive.getTime() - offset);
}

export function utcRangeForLocalDate(date: string, timeZone: string): {
  startUtc: Date;
  endUtc: Date;
} {
  const startUtc = zonedDateTimeToUtc(`${date}T00:00`, timeZone);

  const [year, month, day] = date.split("-").map(Number);
  const nextDay = new Date(Date.UTC(year, month - 1, day + 1));
  const nextDayText = `${nextDay.getUTCFullYear()}-${String(
    nextDay.getUTCMonth() + 1
  ).padStart(2, "0")}-${String(nextDay.getUTCDate()).padStart(2, "0")}`;

  const endUtc = zonedDateTimeToUtc(`${nextDayText}T00:00`, timeZone);

  return { startUtc, endUtc };
}
