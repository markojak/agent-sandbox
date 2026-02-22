import { NextResponse } from "next/server";

import { calculateAdherenceScore, calculateLoggingStreak } from "@/lib/core/adherence";
import { buildDailyTotals, calculateRollingAverage, dayKey } from "@/lib/core/metrics";
import { getUserIdFromAuthHeader } from "@/lib/server/auth-header";
import { listFoodEntries } from "@/lib/server/food-entry-store";

export async function GET(request: Request) {
  const userId = getUserIdFromAuthHeader(request.headers.get("authorization"));
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const endDate = searchParams.get("endDate") ?? new Date().toISOString();
  const goal = Number(searchParams.get("goal") ?? 2000);
  const window = Number(searchParams.get("window") ?? 7);

  const entries = listFoodEntries(userId);
  const end = new Date(endDate);
  end.setUTCHours(23, 59, 59, 999);

  const start = new Date(end);
  start.setUTCDate(end.getUTCDate() - (window - 1));
  start.setUTCHours(0, 0, 0, 0);

  const inWindow = entries.filter((entry) => {
    const date = new Date(entry.consumedAt);
    return date >= start && date <= end;
  });

  const dailyTotals = buildDailyTotals(inWindow);
  const rollingAverage = calculateRollingAverage(dailyTotals, window, end.toISOString());
  const adherenceScore = calculateAdherenceScore(dailyTotals, goal);
  const streak = calculateLoggingStreak(
    inWindow.map((entry) => entry.consumedAt),
    end.toISOString(),
  );

  return NextResponse.json(
    {
      data: {
        window,
        startDate: dayKey(start),
        endDate: dayKey(end),
        dailyTotals,
        rollingAverage,
        adherenceScore,
        streak,
      },
    },
    { status: 200 },
  );
}
