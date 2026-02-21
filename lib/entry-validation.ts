import type { EntryInput } from "@/lib/reuse-store";

const mealNameError = "mealName is required";

export const parseEntryInput = (body: unknown): { data?: EntryInput; error?: string } => {
  if (!body || typeof body !== "object") {
    return { error: "Invalid request body" };
  }

  const candidate = body as Partial<EntryInput>;

  if (!candidate.mealName || !candidate.mealName.trim()) {
    return { error: mealNameError };
  }

  if (typeof candidate.calories !== "number" || candidate.calories <= 0) {
    return { error: "calories must be a positive number" };
  }

  if (!candidate.quantity || !candidate.quantity.trim()) {
    return { error: "quantity is required" };
  }

  if (!candidate.mealTime || !candidate.mealTime.trim()) {
    return { error: "mealTime is required" };
  }

  return {
    data: {
      mealName: candidate.mealName.trim(),
      calories: candidate.calories,
      quantity: candidate.quantity.trim(),
      mealTime: candidate.mealTime.trim(),
      notes: candidate.notes?.trim() || undefined,
    },
  };
};
