import type { Units } from "@/lib/auth/store";

export type ProfileInput = {
  timezone: string;
  units: Units;
  calorieGoal: number;
};

export type ValidationResult =
  | { ok: true; value: ProfileInput }
  | { ok: false; errors: string[] };

const MIN_CALORIES = 800;
const MAX_CALORIES = 8000;

export function validateProfileInput(input: {
  timezone: unknown;
  units: unknown;
  calorieGoal: unknown;
}): ValidationResult {
  const errors: string[] = [];

  const timezone = typeof input.timezone === "string" ? input.timezone.trim() : "";
  const units = input.units;
  const parsedCalories =
    typeof input.calorieGoal === "number"
      ? input.calorieGoal
      : typeof input.calorieGoal === "string"
        ? Number(input.calorieGoal)
        : Number.NaN;

  if (!timezone || !isValidTimeZone(timezone)) {
    errors.push("Please provide a valid IANA timezone (example: America/Chicago).");
  }

  if (units !== "metric" && units !== "imperial") {
    errors.push("Units must be either metric or imperial.");
  }

  if (!Number.isFinite(parsedCalories) || !Number.isInteger(parsedCalories)) {
    errors.push("Calorie goal must be a whole number.");
  } else if (parsedCalories < MIN_CALORIES || parsedCalories > MAX_CALORIES) {
    errors.push(`Calorie goal must be between ${MIN_CALORIES} and ${MAX_CALORIES}.`);
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      timezone,
      units: units as Units,
      calorieGoal: parsedCalories,
    },
  };
}

export function isValidTimeZone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

export function defaultProfileInput(): ProfileInput {
  return {
    timezone: "UTC",
    units: "imperial",
    calorieGoal: 2200,
  };
}
