import type { FoodEntryPayload } from "@/lib/core/food-entry";

export type StoredFoodEntry = FoodEntryPayload & {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

const store = new Map<string, StoredFoodEntry>();
let idCounter = 1;

export function listFoodEntries(userId: string): StoredFoodEntry[] {
  return [...store.values()].filter((entry) => entry.userId === userId);
}

export function getFoodEntry(id: string): StoredFoodEntry | undefined {
  return store.get(id);
}

export function createFoodEntry(userId: string, payload: FoodEntryPayload): StoredFoodEntry {
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
  idCounter = 1;
}
