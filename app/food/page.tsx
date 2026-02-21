"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type FoodEntry = {
  id: string;
  mealName: string;
  calories: number;
  quantity: number;
  mealTime: string;
  notes: string | null;
};

type ManualFormState = {
  mealName: string;
  calories: string;
  quantity: string;
  mealTime: string;
  notes: string;
};

const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
  now.getDate()
).padStart(2, "0")}`;
const localDateTime = `${today}T${String(now.getHours()).padStart(2, "0")}:${String(
  now.getMinutes()
).padStart(2, "0")}`;

export default function FoodPage() {
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [date, setDate] = useState(today);
  const [error, setError] = useState<string | null>(null);
  const [quickAddText, setQuickAddText] = useState("2 eggs and toast 420");
  const [quickMealTime, setQuickMealTime] = useState(localDateTime);
  const [manualForm, setManualForm] = useState<ManualFormState>({
    mealName: "",
    calories: "",
    quantity: "1",
    mealTime: localDateTime,
    notes: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const fetchEntries = useCallback(async () => {
    const response = await fetch(
      `/api/food-entries?date=${date}&timeZone=${encodeURIComponent(timeZone)}`
    );

    const body = await response.json();

    if (!response.ok) {
      setError(body.error ?? "Failed to load entries.");
      return;
    }

    setEntries(body.entries);
  }, [date, timeZone]);

  useEffect(() => {
    void fetchEntries();
  }, [fetchEntries]);

  const totalCalories = useMemo(
    () => entries.reduce((sum, entry) => sum + entry.calories, 0),
    [entries]
  );

  async function createQuickEntry() {
    setError(null);
    const idempotencyKey = crypto.randomUUID();

    const response = await fetch("/api/food-entries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        mode: "quick",
        quickAddText,
        mealTime: quickMealTime,
        timeZone,
      }),
    });

    const body = await response.json();

    if (!response.ok) {
      setError(body.error ?? "Unable to create entry.");
      return;
    }

    await fetchEntries();
  }

  async function createManualEntry() {
    setError(null);
    const idempotencyKey = crypto.randomUUID();

    const response = await fetch("/api/food-entries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        mode: "manual",
        mealName: manualForm.mealName,
        calories: Number(manualForm.calories),
        quantity: Number(manualForm.quantity),
        mealTime: manualForm.mealTime,
        notes: manualForm.notes,
        timeZone,
      }),
    });

    const body = await response.json();

    if (!response.ok) {
      setError(body.error ?? "Unable to create entry.");
      return;
    }

    setManualForm((current) => ({
      ...current,
      mealName: "",
      calories: "",
      notes: "",
    }));

    await fetchEntries();
  }

  async function saveEdit(entry: FoodEntry) {
    setError(null);

    const previous = [...entries];
    setEntries((current) => current.map((item) => (item.id === entry.id ? entry : item)));

    const response = await fetch(`/api/food-entries/${entry.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mealName: entry.mealName,
        calories: Number(entry.calories),
        quantity: Number(entry.quantity),
        mealTime: entry.mealTime.slice(0, 16),
        notes: entry.notes,
        timeZone,
      }),
    });

    const body = await response.json();

    if (!response.ok) {
      setEntries(previous);
      setError(body.error ?? "Unable to update entry.");
      return;
    }

    setEditingId(null);
    await fetchEntries();
  }

  async function removeEntry(id: string) {
    if (!window.confirm("Delete this entry?")) {
      return;
    }

    setError(null);

    const previous = [...entries];
    setEntries((current) => current.filter((entry) => entry.id !== id));

    const response = await fetch(`/api/food-entries/${id}`, { method: "DELETE" });

    if (!response.ok) {
      const body = await response.json();
      setEntries(previous);
      setError(body.error ?? "Unable to delete entry.");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 p-6">
      <h1 className="text-2xl font-bold">Food Entry Tracker</h1>
      <button
        type="button"
        className="w-fit rounded bg-black px-3 py-2 text-white"
        onClick={fetchEntries}
      >
        Load {date}
      </button>

      <label className="flex flex-col gap-1">
        Day
        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="rounded border p-2"
        />
      </label>

      {error ? <p className="rounded bg-red-100 p-2 text-red-700">{error}</p> : null}

      <section className="rounded border p-4">
        <h2 className="font-semibold">Quick add</h2>
        <p className="text-sm text-gray-600">Format: [quantity] meal name calories</p>
        <div className="mt-2 flex flex-col gap-2">
          <input
            value={quickAddText}
            onChange={(event) => setQuickAddText(event.target.value)}
            className="rounded border p-2"
          />
          <input
            type="datetime-local"
            value={quickMealTime}
            onChange={(event) => setQuickMealTime(event.target.value)}
            className="rounded border p-2"
          />
          <button
            type="button"
            className="w-fit rounded bg-black px-3 py-2 text-white"
            onClick={createQuickEntry}
          >
            Add quickly
          </button>
        </div>
      </section>

      <section className="rounded border p-4">
        <h2 className="font-semibold">Manual entry</h2>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <input
            placeholder="Meal name"
            value={manualForm.mealName}
            onChange={(event) =>
              setManualForm((current) => ({ ...current, mealName: event.target.value }))
            }
            className="rounded border p-2"
          />
          <input
            placeholder="Calories"
            value={manualForm.calories}
            onChange={(event) =>
              setManualForm((current) => ({ ...current, calories: event.target.value }))
            }
            className="rounded border p-2"
          />
          <input
            placeholder="Quantity"
            value={manualForm.quantity}
            onChange={(event) =>
              setManualForm((current) => ({ ...current, quantity: event.target.value }))
            }
            className="rounded border p-2"
          />
          <input
            type="datetime-local"
            value={manualForm.mealTime}
            onChange={(event) =>
              setManualForm((current) => ({ ...current, mealTime: event.target.value }))
            }
            className="rounded border p-2"
          />
          <input
            placeholder="Notes"
            value={manualForm.notes}
            onChange={(event) =>
              setManualForm((current) => ({ ...current, notes: event.target.value }))
            }
            className="rounded border p-2 sm:col-span-2"
          />
          <button
            type="button"
            onClick={createManualEntry}
            className="w-fit rounded bg-black px-3 py-2 text-white"
          >
            Save manual entry
          </button>
        </div>
      </section>

      <section className="rounded border p-4">
        <h2 className="font-semibold">Timeline ({entries.length} entries)</h2>
        <p className="text-sm">Total calories: {totalCalories}</p>
        <ul className="mt-3 space-y-2">
          {entries.map((entry) => (
            <li key={entry.id} className="rounded border p-2">
              {editingId === entry.id ? (
                <EntryEditor
                  entry={entry}
                  onCancel={() => setEditingId(null)}
                  onSave={saveEdit}
                />
              ) : (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">{entry.mealName}</p>
                    <p className="text-sm text-gray-600">
                      {entry.calories} kcal · qty {entry.quantity} · {new Date(entry.mealTime).toLocaleString()}
                    </p>
                    {entry.notes ? <p className="text-sm">{entry.notes}</p> : null}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(entry.id)}
                      className="rounded border px-2 py-1"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => removeEntry(entry.id)}
                      className="rounded border px-2 py-1 text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function EntryEditor({
  entry,
  onCancel,
  onSave,
}: {
  entry: FoodEntry;
  onCancel: () => void;
  onSave: (entry: FoodEntry) => Promise<void>;
}) {
  const [draft, setDraft] = useState<FoodEntry>(entry);

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <input
        value={draft.mealName}
        onChange={(event) => setDraft((current) => ({ ...current, mealName: event.target.value }))}
        className="rounded border p-2"
      />
      <input
        value={draft.calories}
        onChange={(event) =>
          setDraft((current) => ({ ...current, calories: Number(event.target.value) }))
        }
        className="rounded border p-2"
      />
      <input
        value={draft.quantity}
        onChange={(event) =>
          setDraft((current) => ({ ...current, quantity: Number(event.target.value) }))
        }
        className="rounded border p-2"
      />
      <input
        type="datetime-local"
        value={draft.mealTime.slice(0, 16)}
        onChange={(event) => setDraft((current) => ({ ...current, mealTime: event.target.value }))}
        className="rounded border p-2"
      />
      <input
        value={draft.notes ?? ""}
        onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))}
        className="rounded border p-2 sm:col-span-2"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onSave(draft)}
          className="rounded bg-black px-2 py-1 text-white"
        >
          Save
        </button>
        <button type="button" onClick={onCancel} className="rounded border px-2 py-1">
          Cancel
        </button>
      </div>
    </div>
  );
}
