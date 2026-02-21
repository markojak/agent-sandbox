import { beforeEach, describe, expect, it } from "vitest";

import { DELETE, PATCH } from "@/app/api/food-entries/[id]/route";
import { GET, POST } from "@/app/api/food-entries/route";
import { resetFoodEntryStoreForTests } from "@/lib/server/food-entry-store";

const baseUrl = "https://example.test";
const authHeader = { authorization: "Bearer user_1", "content-type": "application/json" };

describe("food entry API", () => {
  beforeEach(() => {
    resetFoodEntryStoreForTests();
  });

  it("rejects unauthenticated requests", async () => {
    const response = await GET(new Request(`${baseUrl}/api/food-entries`));
    expect(response.status).toBe(401);
  });

  it("supports authenticated CRUD", async () => {
    const createResponse = await POST(
      new Request(`${baseUrl}/api/food-entries`, {
        method: "POST",
        headers: authHeader,
        body: JSON.stringify({
          name: "Dinner",
          calories: 800,
          consumedAt: "2026-02-21T18:00:00.000Z",
        }),
      }),
    );

    expect(createResponse.status).toBe(201);
    const created = (await createResponse.json()).data;

    const listResponse = await GET(
      new Request(`${baseUrl}/api/food-entries?date=2026-02-21`, {
        headers: { authorization: "Bearer user_1" },
      }),
    );

    const listed = (await listResponse.json()).data;
    expect(listed).toHaveLength(1);

    const patchResponse = await PATCH(
      new Request(`${baseUrl}/api/food-entries/${created.id}`, {
        method: "PATCH",
        headers: authHeader,
        body: JSON.stringify({ calories: 850 }),
      }),
      { params: Promise.resolve({ id: created.id }) },
    );

    expect(patchResponse.status).toBe(200);
    const updated = (await patchResponse.json()).data;
    expect(updated.calories).toBe(850);

    const deleteResponse = await DELETE(
      new Request(`${baseUrl}/api/food-entries/${created.id}`, {
        method: "DELETE",
        headers: { authorization: "Bearer user_1" },
      }),
      { params: Promise.resolve({ id: created.id }) },
    );

    expect(deleteResponse.status).toBe(204);

    const listAfterDelete = await GET(
      new Request(`${baseUrl}/api/food-entries`, {
        headers: { authorization: "Bearer user_1" },
      }),
    );

    expect((await listAfterDelete.json()).data).toHaveLength(0);
  });

  it("returns validation errors for invalid payload", async () => {
    const createResponse = await POST(
      new Request(`${baseUrl}/api/food-entries`, {
        method: "POST",
        headers: authHeader,
        body: JSON.stringify({ name: "", calories: -100, consumedAt: "bad" }),
      }),
    );

    expect(createResponse.status).toBe(400);
  });

  it("guards patch and delete with ownership + not-found checks", async () => {
    const createResponse = await POST(
      new Request(`${baseUrl}/api/food-entries`, {
        method: "POST",
        headers: authHeader,
        body: JSON.stringify({
          name: "Owned meal",
          calories: 500,
          consumedAt: "2026-02-21T10:00:00.000Z",
        }),
      }),
    );

    const created = (await createResponse.json()).data;

    const forbiddenPatch = await PATCH(
      new Request(`${baseUrl}/api/food-entries/${created.id}`, {
        method: "PATCH",
        headers: { ...authHeader, authorization: "Bearer user_2" },
        body: JSON.stringify({ calories: 600 }),
      }),
      { params: Promise.resolve({ id: created.id }) },
    );
    expect(forbiddenPatch.status).toBe(403);

    const notFoundPatch = await PATCH(
      new Request(`${baseUrl}/api/food-entries/missing`, {
        method: "PATCH",
        headers: authHeader,
        body: JSON.stringify({ calories: 600 }),
      }),
      { params: Promise.resolve({ id: "missing" }) },
    );
    expect(notFoundPatch.status).toBe(404);

    const invalidPatch = await PATCH(
      new Request(`${baseUrl}/api/food-entries/${created.id}`, {
        method: "PATCH",
        headers: authHeader,
        body: JSON.stringify({ calories: -1 }),
      }),
      { params: Promise.resolve({ id: created.id }) },
    );
    expect(invalidPatch.status).toBe(400);

    const forbiddenDelete = await DELETE(
      new Request(`${baseUrl}/api/food-entries/${created.id}`, {
        method: "DELETE",
        headers: { authorization: "Bearer user_2" },
      }),
      { params: Promise.resolve({ id: created.id }) },
    );
    expect(forbiddenDelete.status).toBe(403);

    const notFoundDelete = await DELETE(
      new Request(`${baseUrl}/api/food-entries/unknown`, {
        method: "DELETE",
        headers: { authorization: "Bearer user_1" },
      }),
      { params: Promise.resolve({ id: "unknown" }) },
    );
    expect(notFoundDelete.status).toBe(404);
  });
});
