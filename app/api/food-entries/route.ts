import { NextResponse } from "next/server";

import { validateFoodEntryPayload } from "@/lib/core/food-entry";
import { getUserIdFromAuthHeader } from "@/lib/server/auth-header";
import { createFoodEntry, listFoodEntries } from "@/lib/server/food-entry-store";

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

  const entry = createFoodEntry(userId, validation.value);
  return NextResponse.json({ data: entry }, { status: 201 });
}
