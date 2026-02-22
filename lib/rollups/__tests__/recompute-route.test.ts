import { describe, expect, it } from "vitest";

import { POST } from "@/app/api/rollups/recompute/route";
import type { FoodEntry, UserProfile } from "@/lib/rollups";

const profile: UserProfile = {
  userId: "user-1",
  dailyCalorieGoal: 2000,
  timeZone: "UTC",
};

const entries: FoodEntry[] = [
  { id: "1", userId: "user-1", calories: 500, consumedAt: "2026-02-15T08:00:00.000Z" },
  { id: "2", userId: "user-1", calories: 1400, consumedAt: "2026-02-15T18:00:00.000Z" },
];

describe("POST /api/rollups/recompute", () => {
  it("returns 400 when profile.userId does not match userId", async () => {
    const request = new Request("http://localhost/api/rollups/recompute", {
      method: "POST",
      body: JSON.stringify({
        userId: "user-1",
        profile: { ...profile, userId: "user-2" },
        entries,
        startDate: "2026-02-15",
        endDate: "2026-02-21",
      }),
      headers: { "content-type": "application/json" },
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "profile.userId must match userId",
    });
  });

  it("returns 400 when entries include data for another user", async () => {
    const request = new Request("http://localhost/api/rollups/recompute", {
      method: "POST",
      body: JSON.stringify({
        userId: "user-1",
        profile,
        entries: [...entries, { id: "x", userId: "user-2", calories: 3000, consumedAt: "2026-02-15T12:00:00.000Z" }],
        startDate: "2026-02-15",
        endDate: "2026-02-21",
      }),
      headers: { "content-type": "application/json" },
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "entries must only include the requested userId",
    });
  });

  it("returns rollups for a valid payload", async () => {
    const request = new Request("http://localhost/api/rollups/recompute", {
      method: "POST",
      body: JSON.stringify({
        userId: "user-1",
        profile,
        entries,
        startDate: "2026-02-15",
        endDate: "2026-02-21",
      }),
      headers: { "content-type": "application/json" },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.recomputedRange).toEqual({
      startDate: "2026-02-15",
      endDate: "2026-02-21",
    });

    const firstDay = body.rollups.find((rollup: { date: string }) => rollup.date === "2026-02-15");
    expect(firstDay?.totalCalories).toBe(1900);
    expect(firstDay?.entryCount).toBe(2);
  });
});
