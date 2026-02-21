const VALID_UNITS = new Set(["metric", "imperial"]);
const MIN_GOAL = 800;
const MAX_GOAL = 6000;

export function validateCredentials(input) {
  if (!input?.email || !input?.password) {
    return { valid: false, error: "email and password are required" };
  }

  const email = String(input.email).trim().toLowerCase();
  const password = String(input.password);

  if (!email.includes("@")) {
    return { valid: false, error: "email must be valid" };
  }

  if (password.length < 10) {
    return { valid: false, error: "password must be at least 10 characters" };
  }

  return { valid: true, value: { email, password } };
}

export function validateProfileInput(input) {
  if (!input) {
    return { valid: false, error: "profile payload is required" };
  }

  const timezone = String(input.timezone ?? "").trim();
  const units = String(input.units ?? "").trim();
  const dailyCalorieGoal = Number(input.dailyCalorieGoal);

  if (!timezone) {
    return { valid: false, error: "timezone is required" };
  }

  if (!VALID_UNITS.has(units)) {
    return { valid: false, error: "units must be metric or imperial" };
  }

  if (!Number.isInteger(dailyCalorieGoal)) {
    return { valid: false, error: "dailyCalorieGoal must be an integer" };
  }

  if (dailyCalorieGoal < MIN_GOAL || dailyCalorieGoal > MAX_GOAL) {
    return {
      valid: false,
      error: `dailyCalorieGoal must be between ${MIN_GOAL} and ${MAX_GOAL}`,
    };
  }

  return {
    valid: true,
    value: {
      timezone,
      units,
      dailyCalorieGoal,
    },
  };
}
