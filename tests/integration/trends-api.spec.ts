import { beforeEach, describe, expect, it } from "vitest";

import { POST } from "@/app/api/food-entries/route";
import { GET } from "@/app/api/trends/route";
import { resetFoodEntryStoreForTests } from "@/lib/server/food-entry-store";
import { sampleEntries } from "@/tests/fixtures/entries";

const baseUrl = "https://example.test";
const authHeader = { authorization: "Bearer user_1", "content-type": "application/json" };

describe("trends API", () => {
  beforeEach(async () => {
    resetFoodEntryStoreForTests();

    await Promise.all(
      sampleEntries.map((entry) =>
        POST(
          new Request(`${baseUrl}/api/food-entries`, {
            method: "POST",
            headers: authHeader,
            body: JSON.stringify(entry),
          }),
        ),
      ),
    );
  });

  it("returns rollup metrics for an authenticated user", async () => {
    const response = await GET(
      new Request(
        `${baseUrl}/api/trends?window=4&goal=2000&endDate=${encodeURIComponent("2026-02-21T23:59:59.000Z")}`,
        {
          headers: { authorization: "Bearer user_1" },
        },
      ),
    );

    expect(response.status).toBe(200);

    const payload = await response.json();
    expect(payload.data.dailyTotals).toMatchObject({
      "2026-02-18": 300,
      "2026-02-19": 700,
      "2026-02-20": 900,
      "2026-02-21": 500,
    });
    expect(payload.data.rollingAverage).toBe(600);
    expect(payload.data.adherenceScore).toBe(0);
    expect(payload.data.streak).toBe(4);
  });

  it("uses default query values when omitted", async () => {
    const response = await GET(
      new Request(`${baseUrl}/api/trends`, {
        headers: { authorization: "Bearer user_1" },
      }),
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.data.window).toBe(7);
  });

  it("rejects unauthenticated requests", async () => {
    const response = await GET(new Request(`${baseUrl}/api/trends`));
    expect(response.status).toBe(401);
  });
});
