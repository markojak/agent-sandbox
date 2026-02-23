export type Entry = {
  id: string;
  userId: string;
  mealName: string;
  calories: number;
  quantity: string;
  mealTime: string;
  notes?: string;
  isDraft: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FavoriteFood = {
  id: string;
  userId: string;
  sourceEntryId: string;
  mealName: string;
  calories: number;
  quantity: string;
  mealTime: string;
  notes?: string;
  createdAt: string;
};

export type TelemetryEventType =
  | "favorite_added"
  | "favorite_removed"
  | "added_from_favorite"
  | "added_from_recent"
  | "entry_duplicated";

export type TelemetryEvent = {
  id: string;
  type: TelemetryEventType;
  userId: string;
  entryId?: string;
  favoriteId?: string;
  timestamp: string;
};

export type EntryInput = {
  mealName: string;
  calories: number;
  quantity: string;
  mealTime: string;
  notes?: string;
};

export const DEFAULT_LIMIT = 5;

const state = {
  entries: [] as Entry[],
  favorites: [] as FavoriteFood[],
  telemetry: [] as TelemetryEvent[],
};

const getId = () => crypto.randomUUID();

const now = () => new Date().toISOString();

const emit = (event: Omit<TelemetryEvent, "id" | "timestamp">) => {
  state.telemetry.push({
    ...event,
    id: getId(),
    timestamp: now(),
  });
};

export const createEntry = (
  userId: string,
  input: EntryInput,
  source?: "favorite" | "recent",
) => {
  const timestamp = now();
  const entry: Entry = {
    id: getId(),
    userId,
    mealName: input.mealName,
    calories: input.calories,
    quantity: input.quantity,
    mealTime: input.mealTime,
    notes: input.notes,
    isDraft: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  state.entries.push(entry);

  if (source === "favorite") {
    emit({ type: "added_from_favorite", userId, entryId: entry.id });
  }
  if (source === "recent") {
    emit({ type: "added_from_recent", userId, entryId: entry.id });
  }

  return entry;
};

export const listEntries = (userId: string) => {
  return state.entries
    .filter((entry) => entry.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};

export const getEntryById = (userId: string, entryId: string) => {
  return state.entries.find(
    (entry) => entry.id === entryId && entry.userId === userId,
  );
};

export const duplicateEntry = (
  userId: string,
  entryId: string,
  mode: "draft" | "immediate" = "draft",
) => {
  const sourceEntry = getEntryById(userId, entryId);
  if (!sourceEntry) {
    return null;
  }

  const timestamp = now();
  const duplicate: Entry = {
    ...sourceEntry,
    id: getId(),
    isDraft: mode === "draft",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  state.entries.push(duplicate);

  emit({ type: "entry_duplicated", userId, entryId: duplicate.id });
  return duplicate;
};

export const addFavoriteFromEntry = (userId: string, entryId: string) => {
  const sourceEntry = getEntryById(userId, entryId);
  if (!sourceEntry) {
    return null;
  }

  const existing = state.favorites.find(
    (favorite) =>
      favorite.userId === userId &&
      favorite.mealName.trim().toLowerCase() ===
        sourceEntry.mealName.trim().toLowerCase(),
  );

  if (existing) {
    return existing;
  }

  const favorite: FavoriteFood = {
    id: getId(),
    userId,
    sourceEntryId: sourceEntry.id,
    mealName: sourceEntry.mealName,
    calories: sourceEntry.calories,
    quantity: sourceEntry.quantity,
    mealTime: sourceEntry.mealTime,
    notes: sourceEntry.notes,
    createdAt: now(),
  };

  state.favorites.push(favorite);
  emit({ type: "favorite_added", userId, favoriteId: favorite.id });
  return favorite;
};

export const removeFavorite = (userId: string, favoriteId: string) => {
  const favorite = state.favorites.find(
    (item) => item.id === favoriteId && item.userId === userId,
  );
  if (!favorite) {
    return false;
  }

  state.favorites = state.favorites.filter((item) => item.id !== favoriteId);
  emit({ type: "favorite_removed", userId, favoriteId });
  return true;
};

export const listFavorites = (userId: string) => {
  return state.favorites
    .filter((favorite) => favorite.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};

export const listRecents = (userId: string, limit = DEFAULT_LIMIT) => {
  const latestByMeal = new Map<string, Entry>();

  for (const entry of listEntries(userId)) {
    const key = entry.mealName.trim().toLowerCase();
    if (!latestByMeal.has(key) && !entry.isDraft) {
      latestByMeal.set(key, entry);
    }
  }

  return [...latestByMeal.values()]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
};

export const listTelemetryEvents = (userId: string) => {
  return state.telemetry
    .filter((event) => event.userId === userId)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
};

export const resetStore = () => {
  state.entries = [];
  state.favorites = [];
  state.telemetry = [];
};
