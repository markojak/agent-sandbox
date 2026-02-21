import assert from "node:assert/strict";
import test from "node:test";

import { DELETE as deleteFavorite } from "@/app/api/favorites/[favoriteId]/route";
import { GET as getEntries, POST as postEntries } from "@/app/api/entries/route";
import { POST as postDuplicate } from "@/app/api/entries/[entryId]/duplicate/route";
import { GET as getFavorites, POST as postFavorites } from "@/app/api/favorites/route";
import { GET as getRecents } from "@/app/api/recents/route";
import { GET as getTelemetry } from "@/app/api/telemetry/route";
import { resetStore } from "@/lib/reuse-store";

const req = (url: string, userId: string, init?: RequestInit) =>
  new Request(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId,
      ...(init?.headers ?? {}),
    },
  });

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

test.beforeEach(() => {
  resetStore();
});

test("favorites CRUD is user-scoped and blocks cross-user access", async () => {
  const entryResponse = await postEntries(
    req("http://localhost/api/entries", "user-a", {
      method: "POST",
      body: JSON.stringify({
        mealName: "Chicken bowl",
        calories: 700,
        quantity: "1 bowl",
        mealTime: "lunch",
      }),
    }),
  );
  assert.equal(entryResponse.status, 201);
  const createdEntry = (await entryResponse.json()).entry;

  const favoriteResponse = await postFavorites(
    req("http://localhost/api/favorites", "user-a", {
      method: "POST",
      body: JSON.stringify({ entryId: createdEntry.id }),
    }),
  );
  assert.equal(favoriteResponse.status, 201);
  const createdFavorite = (await favoriteResponse.json()).favorite;

  const userAFavorites = await getFavorites(req("http://localhost/api/favorites", "user-a"));
  assert.equal(userAFavorites.status, 200);
  assert.equal((await userAFavorites.json()).favorites.length, 1);

  const userBFavorites = await getFavorites(req("http://localhost/api/favorites", "user-b"));
  assert.equal(userBFavorites.status, 200);
  assert.equal((await userBFavorites.json()).favorites.length, 0);

  const crossUserDelete = await deleteFavorite(req("http://localhost/api/favorites/id", "user-b"), {
    params: Promise.resolve({ favoriteId: createdFavorite.id }),
  });
  assert.equal(crossUserDelete.status, 404);

  const ownerDelete = await deleteFavorite(req("http://localhost/api/favorites/id", "user-a"), {
    params: Promise.resolve({ favoriteId: createdFavorite.id }),
  });
  assert.equal(ownerDelete.status, 204);
});

test("recents returns latest unique meals in descending recency", async () => {
  await postEntries(
    req("http://localhost/api/entries", "user-a", {
      method: "POST",
      body: JSON.stringify({
        mealName: "Oats",
        calories: 350,
        quantity: "1 bowl",
        mealTime: "breakfast",
      }),
    }),
  );

  await sleep(5);

  await postEntries(
    req("http://localhost/api/entries", "user-a", {
      method: "POST",
      body: JSON.stringify({
        mealName: "Salad",
        calories: 420,
        quantity: "1 plate",
        mealTime: "lunch",
      }),
    }),
  );

  await sleep(5);

  await postEntries(
    req("http://localhost/api/entries", "user-a", {
      method: "POST",
      body: JSON.stringify({
        mealName: "Oats",
        calories: 360,
        quantity: "1 bowl",
        mealTime: "dinner",
      }),
    }),
  );

  const recentsResponse = await getRecents(req("http://localhost/api/recents", "user-a"));
  assert.equal(recentsResponse.status, 200);

  const recents = (await recentsResponse.json()).recents;
  assert.equal(recents.length, 2);
  assert.equal(recents[0].mealName, "Oats");
  assert.equal(recents[1].mealName, "Salad");
});

test("reuse actions emit telemetry events for favorite/recent/duplicate", async () => {
  const entryResponse = await postEntries(
    req("http://localhost/api/entries", "user-a", {
      method: "POST",
      body: JSON.stringify({
        mealName: "Turkey wrap",
        calories: 540,
        quantity: "1 wrap",
        mealTime: "lunch",
      }),
    }),
  );
  const sourceEntry = (await entryResponse.json()).entry;

  const favoriteResponse = await postFavorites(
    req("http://localhost/api/favorites", "user-a", {
      method: "POST",
      body: JSON.stringify({ entryId: sourceEntry.id }),
    }),
  );
  const favorite = (await favoriteResponse.json()).favorite;

  await postEntries(
    req("http://localhost/api/entries", "user-a", {
      method: "POST",
      body: JSON.stringify({
        mealName: "Turkey wrap",
        calories: 540,
        quantity: "1 wrap",
        mealTime: "lunch",
        source: "favorite",
      }),
    }),
  );

  await postEntries(
    req("http://localhost/api/entries", "user-a", {
      method: "POST",
      body: JSON.stringify({
        mealName: "Turkey wrap",
        calories: 540,
        quantity: "1 wrap",
        mealTime: "lunch",
        source: "recent",
      }),
    }),
  );

  await postDuplicate(req("http://localhost/api/entries/dup", "user-a", { method: "POST" }), {
    params: Promise.resolve({ entryId: sourceEntry.id }),
  });

  await deleteFavorite(req("http://localhost/api/favorites/id", "user-a", { method: "DELETE" }), {
    params: Promise.resolve({ favoriteId: favorite.id }),
  });

  const telemetryResponse = await getTelemetry(req("http://localhost/api/telemetry", "user-a"));
  const events = (await telemetryResponse.json()).events.map((event: { type: string }) => event.type);

  assert.ok(events.includes("favorite_added"));
  assert.ok(events.includes("added_from_favorite"));
  assert.ok(events.includes("added_from_recent"));
  assert.ok(events.includes("entry_duplicated"));
  assert.ok(events.includes("favorite_removed"));
});

test("all APIs require authenticated user header", async () => {
  const response = await getEntries(new Request("http://localhost/api/entries"));
  assert.equal(response.status, 401);
});
