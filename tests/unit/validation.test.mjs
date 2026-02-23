import test from "node:test";
import assert from "node:assert/strict";
import { validateCredentials, validateProfileInput } from "../../lib/server/validation.mjs";

test("validateCredentials normalizes valid credentials", () => {
  const result = validateCredentials({
    email: "  USER@Example.com ",
    password: "verysecurepw",
  });

  assert.equal(result.valid, true);
  assert.equal(result.value.email, "user@example.com");
});

test("validateProfileInput rejects out-of-range calorie goal", () => {
  const result = validateProfileInput({
    timezone: "America/Chicago",
    units: "metric",
    dailyCalorieGoal: 500,
  });

  assert.equal(result.valid, false);
  assert.match(result.error, /between 800 and 6000/);
});
