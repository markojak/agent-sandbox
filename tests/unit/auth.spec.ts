import { describe, expect, it } from "vitest";

import { getUserIdFromAuthHeader } from "@/lib/server/auth-header";

describe("auth header parsing", () => {
  it("returns null without header", () => {
    expect(getUserIdFromAuthHeader(null)).toBeNull();
  });

  it("returns null for invalid format", () => {
    expect(getUserIdFromAuthHeader("Token abc")).toBeNull();
    expect(getUserIdFromAuthHeader("Bearer")).toBeNull();
  });

  it("extracts bearer token", () => {
    expect(getUserIdFromAuthHeader("Bearer user_1")).toBe("user_1");
  });
});
