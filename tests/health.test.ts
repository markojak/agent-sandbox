import assert from "node:assert/strict";
import test from "node:test";
import { GET } from "@/app/api/health/route";

const ORIGINAL_ENV = { ...process.env };

function setValidEnv() {
  process.env.APP_ENV = "staging";
  process.env.AUTH_SECRET = "12345678901234567890123456789012";
  process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/db";
  process.env.LOG_INGEST_TOKEN = "1234567890123456";
}

test("health endpoint returns 200 when environment is valid", async () => {
  setValidEnv();

  const response = await GET();
  const body = (await response.json()) as { status: string };

  assert.equal(response.status, 200);
  assert.equal(body.status, "ok");
});

test("health endpoint returns 503 when environment is invalid", async () => {
  setValidEnv();
  delete process.env.AUTH_SECRET;

  const response = await GET();
  const body = (await response.json()) as { status: string; checks: string[] };

  assert.equal(response.status, 503);
  assert.equal(body.status, "degraded");
  assert.match(body.checks.join("\n"), /AUTH_SECRET/);
});

test.after(() => {
  process.env = ORIGINAL_ENV;
});
