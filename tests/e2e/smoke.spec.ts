import { beforeEach, describe, expect, it } from "vitest";

import { POST } from "@/app/api/food-entries/route";
import { GET as getTrends } from "@/app/api/trends/route";
import { resetFoodEntryStoreForTests } from "@/lib/server/food-entry-store";

describe("MVP smoke flow", () => {
  beforeEach(() => {
    resetFoodEntryStoreForTests();
  });

  it("creates an entry and reflects it in trends", async () => {
    const create = await POST(
      new Request("https://example.test/api/food-entries", {
        method: "POST",
        headers: {
          authorization: "Bearer smoke_user",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: "Smoke meal",
          calories: 500,
          consumedAt: "2026-02-21T14:00:00.000Z",
        }),
      }),
    );

    expect(create.status).toBe(201);

    const trends = await getTrends(
      new Request(
        "https://example.test/api/trends?window=1&goal=500&endDate=2026-02-21T23%3A59%3A59.000Z",
        {
          headers: { authorization: "Bearer smoke_user" },
        },
      ),
    );

    expect(trends.status).toBe(200);
    const payload = await trends.json();

    expect(payload.data.rollingAverage).toBe(500);
    expect(payload.data.adherenceScore).toBe(1);
    expect(payload.data.streak).toBe(1);
  });
});
