import test from "node:test";
import assert from "node:assert/strict";
import pg from "pg";
import { signup, login, updateProfile } from "../../lib/server/auth-profile-service.mjs";

const { Client } = pg;

async function resetTables() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  await client.query("TRUNCATE TABLE auth_sessions, profiles, users RESTART IDENTITY CASCADE");
  await client.end();
}

test.beforeEach(async () => {
  await resetTables();
});

test("signup -> profile update -> relogin flow", async () => {
  const email = `flow-${Date.now()}@example.com`;
  const password = "password1234";

  const signupResult = await signup({ email, password });
  assert.equal(signupResult.status, 201);
  assert.ok(signupResult.body.token);

  const profileResult = await updateProfile(signupResult.body.token, {
    timezone: "America/Chicago",
    units: "imperial",
    dailyCalorieGoal: 2400,
  });

  assert.equal(profileResult.status, 200);
  assert.equal(profileResult.body.profile.units, "imperial");

  const loginResult = await login({ email, password });
  assert.equal(loginResult.status, 200);
  assert.ok(loginResult.body.token);
});
