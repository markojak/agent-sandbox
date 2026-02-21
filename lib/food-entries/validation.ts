export const CALORIE_LIMITS = {
  min: 1,
  max: 5000,
} as const;

export const QUANTITY_LIMITS = {
  min: 0.1,
  max: 20,
} as const;

export function validateCalories(value: number): string | null {
  if (!Number.isInteger(value)) {
    return "Calories must be a whole number.";
  }

  if (value < CALORIE_LIMITS.min || value > CALORIE_LIMITS.max) {
    return `Calories must be between ${CALORIE_LIMITS.min} and ${CALORIE_LIMITS.max}.`;
  }

  return null;
}

export function validateQuantity(value: number): string | null {
  if (!Number.isFinite(value)) {
    return "Quantity must be a number.";
  }

  if (value < QUANTITY_LIMITS.min || value > QUANTITY_LIMITS.max) {
    return `Quantity must be between ${QUANTITY_LIMITS.min} and ${QUANTITY_LIMITS.max}.`;
  }

  return null;
}

export function validateMealName(mealName: string): string | null {
  if (mealName.trim().length < 2) {
    return "Meal name must be at least 2 characters.";
  }

  if (mealName.trim().length > 120) {
    return "Meal name must be 120 characters or fewer.";
  }

  return null;
}

export function validateTimeZone(timeZone: string): string | null {
  try {
    Intl.DateTimeFormat("en-US", { timeZone });
    return null;
  } catch {
    return "Invalid timezone.";
  }
}

export function validateIsoDate(date: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return "Date must be in YYYY-MM-DD format.";
  }

  return null;
}
