import { describe, expect, it } from "vitest";

import { getRuntimeEnvironment, validateEnvironment } from "@/lib/env";

const validEnv = {
  APP_ENV: "staging",
  AUTH_SECRET: "12345678901234567890123456789012",
  DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
  LOG_INGEST_TOKEN: "1234567890123456",
};

describe("environment validation", () => {
  it("returns ok for valid configuration", () => {
    const result = validateEnvironment(validEnv);
    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("returns actionable errors", () => {
    const result = validateEnvironment({});
    expect(result.ok).toBe(false);
    expect(result.errors).toHaveLength(4);
    expect(result.errors.join("\n")).toMatch(/APP_ENV/);
    expect(result.errors.join("\n")).toMatch(/AUTH_SECRET/);
    expect(result.errors.join("\n")).toMatch(/DATABASE_URL/);
    expect(result.errors.join("\n")).toMatch(/LOG_INGEST_TOKEN/);
  });

  it("throws when config is invalid", () => {
    expect(() => getRuntimeEnvironment({ APP_ENV: "invalid" })).toThrow(/Invalid environment configuration/);
  });
});
