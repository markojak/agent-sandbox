import assert from "node:assert/strict";
import test from "node:test";
import { getRuntimeEnvironment, validateEnvironment } from "@/lib/env";

const validEnv = {
  APP_ENV: "staging",
  AUTH_SECRET: "12345678901234567890123456789012",
  DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
  LOG_INGEST_TOKEN: "1234567890123456",
};

test("validateEnvironment returns ok for valid configuration", () => {
  const result = validateEnvironment(validEnv);
  assert.equal(result.ok, true);
  assert.equal(result.errors.length, 0);
});

test("validateEnvironment returns actionable errors", () => {
  const result = validateEnvironment({});
  assert.equal(result.ok, false);
  assert.equal(result.errors.length, 4);
  assert.match(result.errors.join("\n"), /APP_ENV/);
  assert.match(result.errors.join("\n"), /AUTH_SECRET/);
  assert.match(result.errors.join("\n"), /DATABASE_URL/);
  assert.match(result.errors.join("\n"), /LOG_INGEST_TOKEN/);
});

test("getRuntimeEnvironment throws when config is invalid", () => {
  assert.throws(() => getRuntimeEnvironment({ APP_ENV: "invalid" }), /Invalid environment configuration/);
});
