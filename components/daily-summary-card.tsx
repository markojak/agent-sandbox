type DailySummaryCardProps = {
  dateLabel: string;
  totalCalories: number;
  calorieGoal: number;
  remaining: number;
  overGoal: number;
  isOverGoal: boolean;
  entryCount: number;
};

export function DailySummaryCard(props: DailySummaryCardProps) {
  const {
    dateLabel,
    totalCalories,
    calorieGoal,
    remaining,
    overGoal,
    isOverGoal,
    entryCount,
  } = props;

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm" aria-label="daily-summary">
      <p className="text-sm text-zinc-500">{dateLabel}</p>
      <p className="mt-2 text-3xl font-semibold text-zinc-900">{totalCalories} kcal</p>
      <p className="text-sm text-zinc-500">Goal: {calorieGoal} kcal</p>
      <p className={`mt-2 text-sm font-medium ${isOverGoal ? "text-red-600" : "text-emerald-600"}`}>
        {isOverGoal ? `${overGoal} kcal over goal` : `${remaining} kcal remaining`}
      </p>
      <p className="mt-2 text-xs text-zinc-500">{entryCount} entries logged</p>
    </section>
  );
}
