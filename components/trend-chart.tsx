import type { DailyTotal } from "@/lib/calorie-types";
import { formatReadableDate } from "@/lib/trends";

type TrendChartProps = {
  title: string;
  timezone: string;
  points: DailyTotal[];
};

export function TrendChart({ title, points, timezone }: TrendChartProps) {
  const max = Math.max(...points.map((point) => point.totalCalories), 1);
  const hasAnyData = points.some((point) => point.entryCount > 0);

  if (!hasAnyData) {
    return (
      <section className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4" aria-label={`${title}-empty`}>
        <h3 className="font-medium text-zinc-700">{title}</h3>
        <p className="mt-2 text-sm text-zinc-500">No logs yet. Add a meal to see your calorie trend.</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm" aria-label={title}>
      <h3 className="font-medium text-zinc-800">{title}</h3>
      <div className="mt-4 flex h-36 items-end gap-2">
        {points.map((point) => {
          const heightPct = Math.max((point.totalCalories / max) * 100, point.totalCalories > 0 ? 8 : 3);
          const dateLabel = formatReadableDate(point.date, timezone);

          return (
            <div key={point.date} className="flex flex-1 flex-col items-center gap-1">
              <div
                className={`w-full rounded-sm ${point.entryCount > 0 ? "bg-blue-500" : "bg-zinc-200"}`}
                style={{ height: `${heightPct}%` }}
                title={`${dateLabel}: ${point.totalCalories} kcal`}
                aria-label={`${dateLabel}: ${point.totalCalories} kcal`}
              />
              <span className="text-[10px] text-zinc-500">{dateLabel}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
