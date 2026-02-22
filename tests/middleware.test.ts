import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

describe("middleware rate limiting", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("rate limits repeated auth requests from the same client", async () => {
    const { middleware } = await import("@/middleware");

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const request = new NextRequest("http://localhost/api/auth/login", {
        headers: { "x-forwarded-for": "203.0.113.10" },
      });

      const response = middleware(request);
      expect(response.status).not.toBe(429);
    }

    const blockedRequest = new NextRequest("http://localhost/api/auth/login", {
      headers: { "x-forwarded-for": "203.0.113.10" },
    });
    const blockedResponse = middleware(blockedRequest);
    const body = await blockedResponse.json();

    expect(blockedResponse.status).toBe(429);
    expect(body.error).toMatch(/Too many authentication attempts/i);
    expect(blockedResponse.headers.get("Retry-After")).toBeTruthy();
  });

  it("rate limits repeated log ingest requests from the same client", async () => {
    const { middleware } = await import("@/middleware");

    for (let attempt = 0; attempt < 60; attempt += 1) {
      const request = new NextRequest("http://localhost/api/logs/ingest", {
        headers: { "x-forwarded-for": "203.0.113.20" },
      });

      const response = middleware(request);
      expect(response.status).not.toBe(429);
    }

    const blockedRequest = new NextRequest("http://localhost/api/logs/ingest", {
      headers: { "x-forwarded-for": "203.0.113.20" },
    });
    const blockedResponse = middleware(blockedRequest);
    const body = await blockedResponse.json();

    expect(blockedResponse.status).toBe(429);
    expect(body.error).toMatch(/Log ingestion rate limit exceeded/i);
    expect(blockedResponse.headers.get("Retry-After")).toBeTruthy();
  });
});
