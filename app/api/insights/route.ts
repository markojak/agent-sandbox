import { computeInsightsMetrics } from "@/lib/rollups";
import type { DailyRollup, DateKey } from "@/lib/rollups";

interface InsightsRequest {
  rollups: DailyRollup[];
  goalCalories: number;
  asOfDate: DateKey;
}

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json()) as Partial<InsightsRequest>;

  if (!Array.isArray(body.rollups) || typeof body.goalCalories !== "number" || typeof body.asOfDate !== "string") {
    return Response.json({ error: "rollups, goalCalories, and asOfDate are required" }, { status: 400 });
  }

  const insights = computeInsightsMetrics(body.rollups, body.goalCalories, body.asOfDate as DateKey);

  return Response.json({ insights });
}
