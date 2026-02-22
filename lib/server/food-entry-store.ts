import type { FoodEntryPayload } from "@/lib/core/food-entry";

export type StoredFoodEntry = FoodEntryPayload & {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

type IdempotencyRecord = {
  userId: string;
  entryId: string;
  payloadSignature: string;
};

const store = new Map<string, StoredFoodEntry>();
const idempotencyStore = new Map<string, IdempotencyRecord>();
let idCounter = 1;

function getPayloadSignature(payload: FoodEntryPayload): string {
  return JSON.stringify({
    name: payload.name,
    calories: payload.calories,
    consumedAt: payload.consumedAt,
    quantity: payload.quantity ?? null,
    notes: payload.notes ?? null,
  });
}

function createFoodEntryInternal(userId: string, payload: FoodEntryPayload): StoredFoodEntry {
  const now = new Date().toISOString();
  const entry: StoredFoodEntry = {
    ...payload,
    id: `entry_${idCounter}`,
    userId,
    createdAt: now,
    updatedAt: now,
  };

  idCounter += 1;
  store.set(entry.id, entry);
  return entry;
}

export function listFoodEntries(userId: string): StoredFoodEntry[] {
  return [...store.values()].filter((entry) => entry.userId === userId);
}

export function getFoodEntry(id: string): StoredFoodEntry | undefined {
  return store.get(id);
}

export function createFoodEntry(userId: string, payload: FoodEntryPayload): StoredFoodEntry {
  return createFoodEntryInternal(userId, payload);
}

export function createFoodEntryWithIdempotency(
  userId: string,
  payload: FoodEntryPayload,
  idempotencyKey: string,
): { status: "created"; entry: StoredFoodEntry } | { status: "replayed"; entry: StoredFoodEntry } | { status: "conflict" } {
  const payloadSignature = getPayloadSignature(payload);
  const existing = idempotencyStore.get(idempotencyKey);

  if (existing) {
    if (existing.userId !== userId || existing.payloadSignature !== payloadSignature) {
      return { status: "conflict" };
    }

    const entry = getFoodEntry(existing.entryId);
    if (entry) {
      return { status: "replayed", entry };
    }
  }

  const entry = createFoodEntryInternal(userId, payload);
  idempotencyStore.set(idempotencyKey, {
    userId,
    entryId: entry.id,
    payloadSignature,
  });

  return { status: "created", entry };
}

export function updateFoodEntry(id: string, payload: Partial<FoodEntryPayload>): StoredFoodEntry | null {
  const existing = store.get(id);
  if (!existing) {
    return null;
  }

  const updated: StoredFoodEntry = {
    ...existing,
    ...payload,
    updatedAt: new Date().toISOString(),
  };

  store.set(id, updated);
  return updated;
}

export function deleteFoodEntry(id: string): boolean {
  return store.delete(id);
}

export function resetFoodEntryStoreForTests(): void {
  store.clear();
  idempotencyStore.clear();
  idCounter = 1;
}
