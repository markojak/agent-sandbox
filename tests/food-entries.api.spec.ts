import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { GET, POST } from "@/app/api/food-entries/route";
import { DELETE, PATCH } from "@/app/api/food-entries/[id]/route";

beforeAll(async () => {
  await prisma.$connect();
});

beforeEach(async () => {
  await prisma.foodEntry.deleteMany();
});

describe("food entries API", () => {
  it("creates, reads, updates, and deletes an entry", async () => {
    const createResponse = await POST(
      new Request("http://localhost/api/food-entries", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "idempotency-key": "entry-1",
        },
        body: JSON.stringify({
          mode: "manual",
          mealName: "Chicken bowl",
          calories: 640,
          quantity: 1,
          mealTime: "2026-02-20T12:15",
          notes: "lunch",
          timeZone: "America/Chicago",
        }),
      })
    );

    expect(createResponse.status).toBe(201);
    const createBody = await createResponse.json();

    const readResponse = await GET(
      new Request(
        "http://localhost/api/food-entries?date=2026-02-20&timeZone=America%2FChicago"
      )
    );

    expect(readResponse.status).toBe(200);
    const readBody = await readResponse.json();
    expect(readBody.entries).toHaveLength(1);

    const entryId = createBody.entry.id as string;

    const updateResponse = await PATCH(
      new Request(`http://localhost/api/food-entries/${entryId}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          mealName: "Chicken rice bowl",
          calories: 600,
          quantity: 1,
          mealTime: "2026-02-20T12:45",
          notes: "updated",
          timeZone: "America/Chicago",
        }),
      }),
      { params: Promise.resolve({ id: entryId }) }
    );

    expect(updateResponse.status).toBe(200);
    const updateBody = await updateResponse.json();
    expect(updateBody.entry.mealName).toBe("Chicken rice bowl");

    const deleteResponse = await DELETE(
      new Request(`http://localhost/api/food-entries/${entryId}`, {
        method: "DELETE",
      }),
      { params: Promise.resolve({ id: entryId }) }
    );

    expect(deleteResponse.status).toBe(200);

    const readAfterDelete = await GET(
      new Request(
        "http://localhost/api/food-entries?date=2026-02-20&timeZone=America%2FChicago"
      )
    );
    const readAfterDeleteBody = await readAfterDelete.json();
    expect(readAfterDeleteBody.entries).toHaveLength(0);
  });

  it("does not double-create with same idempotency key", async () => {
    const request = new Request("http://localhost/api/food-entries", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "idempotency-key": "same-key",
      },
      body: JSON.stringify({
        mode: "quick",
        quickAddText: "2 eggs and toast 420",
        mealTime: "2026-02-20T08:00",
        timeZone: "America/Chicago",
      }),
    });

    const first = await POST(request.clone());
    const second = await POST(request.clone());

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);

    const entries = await prisma.foodEntry.findMany();
    expect(entries).toHaveLength(1);
  });

  it("filters day reads by timezone-aware boundaries", async () => {
    await POST(
      new Request("http://localhost/api/food-entries", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          mode: "manual",
          mealName: "Late meal",
          calories: 500,
          quantity: 1,
          mealTime: "2026-02-20T23:30",
          timeZone: "America/Chicago",
        }),
      })
    );

    await POST(
      new Request("http://localhost/api/food-entries", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          mode: "manual",
          mealName: "Next day meal",
          calories: 300,
          quantity: 1,
          mealTime: "2026-02-21T00:15",
          timeZone: "America/Chicago",
        }),
      })
    );

    const dayOne = await GET(
      new Request(
        "http://localhost/api/food-entries?date=2026-02-20&timeZone=America%2FChicago"
      )
    );
    const dayOneBody = await dayOne.json();

    const dayTwo = await GET(
      new Request(
        "http://localhost/api/food-entries?date=2026-02-21&timeZone=America%2FChicago"
      )
    );
    const dayTwoBody = await dayTwo.json();

    expect(dayOneBody.entries).toHaveLength(1);
    expect(dayOneBody.entries[0].mealName).toBe("Late meal");
    expect(dayTwoBody.entries).toHaveLength(1);
    expect(dayTwoBody.entries[0].mealName).toBe("Next day meal");
  });

  it("rejects invalid numeric input with clear message", async () => {
    const response = await POST(
      new Request("http://localhost/api/food-entries", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          mode: "manual",
          mealName: "Protein shake",
          calories: 0,
          quantity: 1,
          mealTime: "2026-02-20T07:00",
          timeZone: "America/Chicago",
        }),
      })
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Calories must be between 1 and 5000.");
  });
});
