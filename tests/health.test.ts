import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const originalEnv = { ...process.env };

const mockQuery = vi.fn();

vi.mock("@/lib/server/db.mjs", () => ({
  getPool: () => ({
    query: mockQuery,
  }),
}));

function setValidEnv() {
  process.env.APP_ENV = "staging";
  process.env.AUTH_SECRET = "12345678901234567890123456789012";
  process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/db";
  process.env.LOG_INGEST_TOKEN = "1234567890123456";
}

describe("health endpoint", () => {
  beforeEach(() => {
    mockQuery.mockReset();
    mockQuery.mockResolvedValue({ rows: [{ "?column?": 1 }] });
  });

  it("returns 200 when environment is valid and database is reachable", async () => {
    setValidEnv();
    const { GET } = await import("@/app/api/health/route");

    const response = await GET();
    const body = (await response.json()) as { status: string; dependencies: { database: string } };

    expect(response.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.dependencies.database).toBe("ready");
  });

  it("returns 503 when environment is invalid", async () => {
    setValidEnv();
    delete process.env.AUTH_SECRET;
    const { GET } = await import("@/app/api/health/route");

    const response = await GET();
    const body = (await response.json()) as { status: string; checks: string[] };

    expect(response.status).toBe(503);
    expect(body.status).toBe("degraded");
    expect(body.checks.join("\n")).toMatch(/AUTH_SECRET/);
  });

  it("returns 503 when database connectivity check fails", async () => {
    setValidEnv();
    mockQuery.mockRejectedValue(new Error("connect ECONNREFUSED"));
    const { GET } = await import("@/app/api/health/route");

    const response = await GET();
    const body = (await response.json()) as {
      status: string;
      dependencies: { database: string };
      checks: string[];
    };

    expect(response.status).toBe(503);
    expect(body.status).toBe("degraded");
    expect(body.dependencies.database).toBe("unreachable");
    expect(body.checks).toContain("Database connectivity check failed.");
  });
});

afterAll(() => {
  process.env = originalEnv;
});
