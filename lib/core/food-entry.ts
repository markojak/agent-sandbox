export type FoodEntryPayload = {
  name: string;
  calories: number;
  consumedAt: string;
  quantity?: number;
  notes?: string;
};

export type ValidationResult =
  | { ok: true; value: FoodEntryPayload }
  | { ok: false; errors: string[] };

export function parseCalories(input: number | string): number | null {
  const value = typeof input === "number" ? input : Number.parseFloat(input.trim());

  if (!Number.isFinite(value)) {
    return null;
  }

  const rounded = Math.round(value);
  if (rounded <= 0) {
    return null;
  }

  return rounded;
}

export function parseQuickEntry(input: string): Pick<FoodEntryPayload, "name" | "calories"> | null {
  const [namePart, caloriesPart] = input.split(":");
  if (!namePart || !caloriesPart) {
    return null;
  }

  const name = namePart.trim();
  const calories = parseCalories(caloriesPart);

  if (!name || calories === null) {
    return null;
  }

  return { name, calories };
}

export function validateFoodEntryPayload(payload: unknown): ValidationResult {
  const errors: string[] = [];
  const candidate = payload as Partial<FoodEntryPayload> | null;

  if (!candidate || typeof candidate !== "object") {
    return { ok: false, errors: ["Payload must be an object"] };
  }

  const name = typeof candidate.name === "string" ? candidate.name.trim() : "";
  if (!name) {
    errors.push("name is required");
  }

  const calories = parseCalories(candidate.calories as number | string);
  if (calories === null) {
    errors.push("calories must be a positive number");
  }

  const consumedAt = typeof candidate.consumedAt === "string" ? candidate.consumedAt : "";
  if (!consumedAt || Number.isNaN(new Date(consumedAt).valueOf())) {
    errors.push("consumedAt must be a valid ISO date string");
  }

  let quantity: number | undefined;
  if (candidate.quantity !== undefined) {
    const parsedQuantity = Number(candidate.quantity);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      errors.push("quantity must be a positive number when provided");
    } else {
      quantity = parsedQuantity;
    }
  }

  if (errors.length > 0 || calories === null) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      name,
      calories,
      consumedAt: new Date(consumedAt).toISOString(),
      quantity,
      notes: typeof candidate.notes === "string" ? candidate.notes.trim() || undefined : undefined,
    },
  };
}
