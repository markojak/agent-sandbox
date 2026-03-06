import { materializeDailyRollups } from "@/lib/rollups";
import type { DailyRollup, DateKey, FoodEntry, UserProfile } from "@/lib/rollups";

interface RecomputeRollupsRequest {
  userId: string;
  profile: UserProfile;
  entries: FoodEntry[];
  existingRollups?: DailyRollup[];
  startDate: DateKey;
  endDate: DateKey;
  changedEntryDates?: DateKey[];
}

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json()) as Partial<RecomputeRollupsRequest>;

  if (
    typeof body.userId !== "string" ||
    !body.profile ||
    !Array.isArray(body.entries) ||
    typeof body.startDate !== "string" ||
    typeof body.endDate !== "string"
  ) {
    return Response.json(
      {
        error: "userId, profile, entries, startDate, and endDate are required",
      },
      { status: 400 },
    );
  }

  if (body.profile.userId !== body.userId) {
    return Response.json({ error: "profile.userId must match userId" }, { status: 400 });
  }

  if (body.entries.some((entry) => entry.userId !== body.userId)) {
    return Response.json({ error: "entries must only include the requested userId" }, { status: 400 });
  }

  const result = materializeDailyRollups({
    userId: body.userId,
    profile: body.profile,
    entries: body.entries,
    existingRollups: body.existingRollups,
    startDate: body.startDate as DateKey,
    endDate: body.endDate as DateKey,
    changedEntryDates: body.changedEntryDates,
  });

  return Response.json(result);
}
