import { NextResponse } from "next/server";

import { validateFoodEntryPayload } from "@/lib/core/food-entry";
import { getUserIdFromAuthHeader } from "@/lib/server/auth-header";
import {
  createFoodEntry,
  createFoodEntryWithIdempotency,
  listFoodEntries,
} from "@/lib/server/food-entry-store";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(request: Request) {
  const userId = getUserIdFromAuthHeader(request.headers.get("authorization"));
  if (!userId) {
    return unauthorized();
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const entries = listFoodEntries(userId);

  const filtered = date
    ? entries.filter((entry) => entry.consumedAt.startsWith(date))
    : entries;

  return NextResponse.json({ data: filtered }, { status: 200 });
}

export async function POST(request: Request) {
  const userId = getUserIdFromAuthHeader(request.headers.get("authorization"));
  if (!userId) {
    return unauthorized();
  }

  const payload = await request.json();
  const validation = validateFoodEntryPayload(payload);

  if (!validation.ok) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  const idempotencyKey = request.headers.get("idempotency-key")?.trim();
  if (idempotencyKey) {
    const result = createFoodEntryWithIdempotency(userId, validation.value, idempotencyKey);

    if (result.status === "conflict") {
      return NextResponse.json(
        { error: "Idempotency key already used with different payload" },
        { status: 409 },
      );
    }

    return NextResponse.json({ data: result.entry }, { status: result.status === "created" ? 201 : 200 });
  }

  const entry = createFoodEntry(userId, validation.value);
  return NextResponse.json({ data: entry }, { status: 201 });
}
