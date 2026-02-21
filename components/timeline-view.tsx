"use client";

import { useEffect, useMemo, useState } from "react";

import { DailySummaryCard } from "@/components/daily-summary-card";
import { TrendChart } from "@/components/trend-chart";
import { fetchPersistedEntries } from "@/lib/calorie-data";
import type { FoodEntry } from "@/lib/calorie-types";
import { getDailySummary } from "@/lib/daily-summary";
import { buildTrendSeries, formatReadableDate, getDateKey } from "@/lib/trends";

function parseDateKey(dateKey: string) {
  return new Date(`${dateKey}T12:00:00.000Z`);
}

export function TimelineView({ initialGoal, timezone }: { initialGoal: number; timezone: string }) {
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [calorieGoal, setCalorieGoal] = useState(initialGoal);
  const [selectedDateKey, setSelectedDateKey] = useState(() => getDateKey(new Date(), timezone));

  useEffect(() => {
    fetchPersistedEntries().then(setEntries);
  }, []);

  const selectedDate = useMemo(() => parseDateKey(selectedDateKey), [selectedDateKey]);
  const summary = useMemo(
    () => getDailySummary(entries, timezone, selectedDate, calorieGoal),
    [entries, timezone, selectedDate, calorieGoal],
  );

  const entriesForSelectedDate = useMemo(
    () => entries.filter((entry) => getDateKey(new Date(entry.consumedAt), timezone) === selectedDateKey),
    [entries, selectedDateKey, timezone],
  );

  const trend7 = useMemo(() => buildTrendSeries(entries, timezone, 7, selectedDate), [entries, timezone, selectedDate]);
  const trend30 = useMemo(() => buildTrendSeries(entries, timezone, 30, selectedDate), [entries, timezone, selectedDate]);

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">Calorie Timeline</h1>
            <p className="text-sm text-zinc-600">Daily totals + 7/30 day trends</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="flex flex-col text-sm text-zinc-700">
              Date
              <input
                className="rounded-md border border-zinc-300 bg-white px-2 py-1"
                type="date"
                value={selectedDateKey}
                onChange={(event) => setSelectedDateKey(event.target.value)}
              />
            </label>
            <label className="flex flex-col text-sm text-zinc-700">
              Daily goal (kcal)
              <input
                className="rounded-md border border-zinc-300 bg-white px-2 py-1"
                type="number"
                min={1000}
                max={6000}
                step={50}
                value={calorieGoal}
                onChange={(event) => setCalorieGoal(Number(event.target.value))}
              />
            </label>
          </div>
        </header>

        <DailySummaryCard
          dateLabel={formatReadableDate(summary.dateKey, timezone)}
          totalCalories={summary.totalCalories}
          calorieGoal={summary.calorieGoal}
          remaining={summary.remaining}
          overGoal={summary.overGoal}
          isOverGoal={summary.isOverGoal}
          entryCount={summary.entryCount}
        />

        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm" aria-label="timeline">
          <h2 className="font-medium text-zinc-800">Timeline entries</h2>
          {entriesForSelectedDate.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500">No entries logged for this day.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {entriesForSelectedDate.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between rounded-md border border-zinc-200 p-2">
                  <span className="text-sm text-zinc-700">{entry.mealName}</span>
                  <span className="text-sm font-medium text-zinc-900">{entry.calories} kcal</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <TrendChart title="7-day trend" points={trend7} timezone={timezone} />
          <TrendChart title="30-day trend" points={trend30} timezone={timezone} />
        </div>
      </main>
    </div>
  );
}
