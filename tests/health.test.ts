import { afterAll, describe, expect, it } from "vitest";

import { GET } from "@/app/api/health/route";

const originalEnv = { ...process.env };

function setValidEnv() {
  process.env.APP_ENV = "staging";
  process.env.AUTH_SECRET = "12345678901234567890123456789012";
  process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/db";
  process.env.LOG_INGEST_TOKEN = "1234567890123456";
}

describe("health endpoint", () => {
  it("returns 200 when environment is valid", async () => {
    setValidEnv();

    const response = await GET();
    const body = (await response.json()) as { status: string };

    expect(response.status).toBe(200);
    expect(body.status).toBe("ok");
  });

  it("returns 503 when environment is invalid", async () => {
    setValidEnv();
    delete process.env.AUTH_SECRET;

    const response = await GET();
    const body = (await response.json()) as { status: string; checks: string[] };

    expect(response.status).toBe(503);
    expect(body.status).toBe("degraded");
    expect(body.checks.join("\n")).toMatch(/AUTH_SECRET/);
  });
});

afterAll(() => {
  process.env = originalEnv;
});
