"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Entry = {
  id: string;
  mealName: string;
  calories: number;
  quantity: string;
  mealTime: string;
  notes?: string;
  isDraft: boolean;
  createdAt: string;
};

type Favorite = {
  id: string;
  sourceEntryId: string;
  mealName: string;
  calories: number;
  quantity: string;
  mealTime: string;
  notes?: string;
};

type EntryForm = {
  mealName: string;
  calories: string;
  quantity: string;
  mealTime: string;
  notes: string;
};

const initialForm: EntryForm = {
  mealName: "",
  calories: "",
  quantity: "1 serving",
  mealTime: "breakfast",
  notes: "",
};

const users = ["demo-user-a", "demo-user-b"];

export default function ReuseDemoPage() {
  const [userId, setUserId] = useState(users[0]);
  const [form, setForm] = useState<EntryForm>(initialForm);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [recents, setRecents] = useState<Entry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const favoriteIdByEntryId = useMemo(() => {
    const map = new Map<string, string>();
    for (const favorite of favorites) {
      map.set(favorite.sourceEntryId, favorite.id);
    }
    return map;
  }, [favorites]);

  const headers = useMemo(
    () => ({ "Content-Type": "application/json", "x-user-id": userId }),
    [userId],
  );

  const load = async () => {
    const [entriesRes, favoritesRes, recentsRes] = await Promise.all([
      fetch("/api/entries", { headers }),
      fetch("/api/favorites", { headers }),
      fetch("/api/recents", { headers }),
    ]);

    const [entriesData, favoritesData, recentsData] = await Promise.all([
      entriesRes.json(),
      favoritesRes.json(),
      recentsRes.json(),
    ]);

    setEntries(entriesData.entries || []);
    setFavorites(favoritesData.favorites || []);
    setRecents(recentsData.recents || []);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const submitEntry = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const calories = Number(form.calories);
    if (!form.mealName || !Number.isFinite(calories) || calories <= 0) {
      setError("Please enter meal name and a positive calorie value.");
      return;
    }

    const response = await fetch("/api/entries", {
      method: "POST",
      headers,
      body: JSON.stringify({
        mealName: form.mealName,
        calories,
        quantity: form.quantity,
        mealTime: form.mealTime,
        notes: form.notes,
      }),
    });

    if (!response.ok) {
      setError("Unable to save entry.");
      return;
    }

    setForm(initialForm);
    await load();
  };

  const addFavorite = async (entryId: string) => {
    await fetch("/api/favorites", {
      method: "POST",
      headers,
      body: JSON.stringify({ entryId }),
    });
    await load();
  };

  const removeFavorite = async (favoriteId: string) => {
    await fetch(`/api/favorites/${favoriteId}`, {
      method: "DELETE",
      headers,
    });
    await load();
  };

  const oneTapAdd = async (
    source: "favorite" | "recent",
    payload: Favorite | Entry,
  ) => {
    await fetch("/api/entries", {
      method: "POST",
      headers,
      body: JSON.stringify({
        mealName: payload.mealName,
        calories: payload.calories,
        quantity: payload.quantity,
        mealTime: payload.mealTime,
        notes: payload.notes,
        source,
      }),
    });
    await load();
  };

  const duplicate = async (entryId: string, mode: "draft" | "immediate") => {
    await fetch(`/api/entries/${entryId}/duplicate`, {
      method: "POST",
      headers,
      body: JSON.stringify({ mode }),
    });
    await load();
  };

  const prefill = (payload: Favorite | Entry) => {
    setForm({
      mealName: payload.mealName,
      calories: String(payload.calories),
      quantity: payload.quantity,
      mealTime: payload.mealTime,
      notes: payload.notes || "",
    });
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-bold">ShardCode Meal Reuse MVP</h1>

      <label className="flex max-w-xs flex-col gap-1 text-sm">
        Active user (privacy-scope demo)
        <select
          className="rounded border p-2"
          value={userId}
          onChange={(event) => setUserId(event.target.value)}
        >
          {users.map((user) => (
            <option key={user} value={user}>
              {user}
            </option>
          ))}
        </select>
      </label>

      <section className="rounded border p-4">
        <h2 className="mb-3 text-lg font-semibold">Add entry</h2>
        <form className="grid gap-2 sm:grid-cols-2" onSubmit={submitEntry}>
          <input
            className="rounded border p-2"
            placeholder="Meal"
            value={form.mealName}
            onChange={(event) =>
              setForm({ ...form, mealName: event.target.value })
            }
          />
          <input
            className="rounded border p-2"
            placeholder="Calories"
            type="number"
            value={form.calories}
            onChange={(event) =>
              setForm({ ...form, calories: event.target.value })
            }
          />
          <input
            className="rounded border p-2"
            placeholder="Quantity"
            value={form.quantity}
            onChange={(event) =>
              setForm({ ...form, quantity: event.target.value })
            }
          />
          <input
            className="rounded border p-2"
            placeholder="Meal time"
            value={form.mealTime}
            onChange={(event) =>
              setForm({ ...form, mealTime: event.target.value })
            }
          />
          <input
            className="rounded border p-2 sm:col-span-2"
            placeholder="Notes"
            value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
          />
          <button
            className="rounded bg-black px-4 py-2 text-white sm:col-span-2"
            type="submit"
          >
            Save entry
          </button>
        </form>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded border p-4">
          <h2 className="mb-3 text-lg font-semibold">Favorites</h2>
          <ul className="space-y-2">
            {favorites.map((favorite) => (
              <li key={favorite.id} className="rounded border p-2">
                <p className="font-medium">{favorite.mealName}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    className="rounded border px-2 py-1"
                    onClick={() => prefill(favorite)}
                  >
                    Prefill
                  </button>
                  <button
                    className="rounded border px-2 py-1"
                    onClick={() => void oneTapAdd("favorite", favorite)}
                  >
                    Add now
                  </button>
                  <button
                    className="rounded border px-2 py-1"
                    onClick={() => void removeFavorite(favorite.id)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded border p-4">
          <h2 className="mb-3 text-lg font-semibold">
            Recents (descending recency)
          </h2>
          <ul className="space-y-2">
            {recents.map((recent) => (
              <li key={recent.id} className="rounded border p-2">
                <p className="font-medium">{recent.mealName}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    className="rounded border px-2 py-1"
                    onClick={() => prefill(recent)}
                  >
                    Prefill
                  </button>
                  <button
                    className="rounded border px-2 py-1"
                    onClick={() => void oneTapAdd("recent", recent)}
                  >
                    Add now
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded border p-4">
        <h2 className="mb-3 text-lg font-semibold">Entries</h2>
        <ul className="space-y-2">
          {entries.map((entry) => {
            const favoriteId = favoriteIdByEntryId.get(entry.id);
            return (
              <li key={entry.id} className="rounded border p-2">
                <p>
                  <span className="font-medium">{entry.mealName}</span> ·{" "}
                  {entry.calories} cal · {entry.quantity}
                  {entry.isDraft ? " · Draft" : ""}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-sm">
                  {favoriteId ? (
                    <button
                      className="rounded border px-2 py-1"
                      onClick={() => void removeFavorite(favoriteId)}
                    >
                      Unfavorite
                    </button>
                  ) : (
                    <button
                      className="rounded border px-2 py-1"
                      onClick={() => void addFavorite(entry.id)}
                    >
                      Favorite
                    </button>
                  )}
                  <button
                    className="rounded border px-2 py-1"
                    onClick={() => void duplicate(entry.id, "draft")}
                  >
                    Duplicate as draft
                  </button>
                  <button
                    className="rounded border px-2 py-1"
                    onClick={() => void duplicate(entry.id, "immediate")}
                  >
                    Duplicate now
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
