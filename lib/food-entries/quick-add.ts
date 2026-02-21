import { validateCalories, validateMealName, validateQuantity } from "./validation";

export type QuickAddParseResult =
  | {
      success: true;
      value: {
        mealName: string;
        calories: number;
        quantity: number;
      };
    }
  | {
      success: false;
      error: string;
    };

export function parseQuickAdd(input: string): QuickAddParseResult {
  const normalized = input.trim().replace(/\s+/g, " ");

  if (!normalized) {
    return { success: false, error: "Quick add text is required." };
  }

  const parts = normalized.split(" ");
  const first = parts[0];
  const last = parts[parts.length - 1];

  const possibleQuantity = Number(first);
  const hasQuantity = Number.isFinite(possibleQuantity);

  const possibleCalories = Number(last);
  const hasCalories = Number.isInteger(possibleCalories);

  if (!hasCalories) {
    return {
      success: false,
      error:
        "Quick add must end with calories, e.g. '2 eggs and toast 420'.",
    };
  }

  const quantity = hasQuantity ? possibleQuantity : 1;
  const mealNameParts = parts.slice(hasQuantity ? 1 : 0, -1);
  const mealName = mealNameParts.join(" ").trim();

  if (!mealName) {
    return { success: false, error: "Meal name is required in quick add text." };
  }

  const mealNameError = validateMealName(mealName);
  if (mealNameError) {
    return { success: false, error: mealNameError };
  }

  const calorieError = validateCalories(possibleCalories);
  if (calorieError) {
    return { success: false, error: calorieError };
  }

  const quantityError = validateQuantity(quantity);
  if (quantityError) {
    return { success: false, error: quantityError };
  }

  return {
    success: true,
    value: {
      mealName,
      calories: possibleCalories,
      quantity,
    },
  };
}
