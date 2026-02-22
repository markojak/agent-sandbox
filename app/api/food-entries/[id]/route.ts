import { NextResponse } from "next/server";

import { validateFoodEntryPayload } from "@/lib/core/food-entry";
import { getUserIdFromAuthHeader } from "@/lib/server/auth-header";
import { deleteFoodEntry, getFoodEntry, updateFoodEntry } from "@/lib/server/food-entry-store";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const userId = getUserIdFromAuthHeader(request.headers.get("authorization"));
  if (!userId) {
    return unauthorized();
  }

  const { id } = await context.params;
  const existing = getFoodEntry(id);

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (existing.userId !== userId) {
    return forbidden();
  }

  const patch = await request.json();
  const merged = {
    name: patch.name ?? existing.name,
    calories: patch.calories ?? existing.calories,
    consumedAt: patch.consumedAt ?? existing.consumedAt,
    quantity: patch.quantity ?? existing.quantity,
    notes: patch.notes ?? existing.notes,
  };

  const validation = validateFoodEntryPayload(merged);
  if (!validation.ok) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  const updated = updateFoodEntry(id, validation.value);
  return NextResponse.json({ data: updated }, { status: 200 });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const userId = getUserIdFromAuthHeader(request.headers.get("authorization"));
  if (!userId) {
    return unauthorized();
  }

  const { id } = await context.params;
  const existing = getFoodEntry(id);

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (existing.userId !== userId) {
    return forbidden();
  }

  deleteFoodEntry(id);
  return new NextResponse(null, { status: 204 });
}
