import { beforeEach, describe, expect, it, vi } from "vitest";

import { clearAnalyticsDedupeCache } from "@/lib/observability/analytics";

vi.mock("@/lib/server/auth-profile-service.mjs", () => ({
  login: vi.fn(),
  signup: vi.fn(),
  updateProfile: vi.fn(),
}));

import { POST as loginPost } from "@/app/api/auth/login/route";
import { POST as signupPost } from "@/app/api/auth/signup/route";
import { PATCH as profilePatch } from "@/app/api/profile/route";
import { login, signup, updateProfile } from "@/lib/server/auth-profile-service.mjs";

function getLoggedEvents(spy: ReturnType<typeof vi.spyOn>): Array<{ event: string; payload: Record<string, unknown> }> {
  return spy.mock.calls.map((call: unknown[]) => {
    const line = String(call[0]);
    const parsed = JSON.parse(line) as { event: string; payload: Record<string, unknown> };
    return { event: parsed.event, payload: parsed.payload };
  });
}

describe("core API routes observability", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearAnalyticsDedupeCache();
  });

  it("wraps auth/login and profile routes with api_request logging + correlation id", async () => {
    vi.mocked(login).mockResolvedValue({
      status: 200,
      body: { token: "token-1", user: { id: "user-1", email: "user@example.com" } },
    });
    vi.mocked(updateProfile).mockResolvedValue({
      status: 200,
      body: { profile: { timezone: "UTC", units: "metric", dailyCalorieGoal: 2200 } },
    });

    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);

    const loginResponse = await loginPost(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-request-id": "req-login-1",
        },
        body: JSON.stringify({ email: "user@example.com", password: "password123" }),
      }),
    );

    const profileResponse = await profilePatch(
      new Request("http://localhost/api/profile", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "x-request-id": "req-profile-1",
          authorization: "Bearer token-123",
        },
        body: JSON.stringify({ timezone: "UTC", units: "metric", dailyCalorieGoal: 2200 }),
      }),
    );

    expect(loginResponse.headers.get("x-request-id")).toBe("req-login-1");
    expect(profileResponse.headers.get("x-request-id")).toBe("req-profile-1");

    const events = getLoggedEvents(infoSpy).filter((entry) => entry.event === "api_request");
    expect(events.map((entry) => entry.payload.route)).toEqual(["/api/auth/login", "/api/profile"]);

    infoSpy.mockRestore();
  });

  it("emits sign_up analytics on live /api/auth/signup endpoint (deduped by idempotency key)", async () => {
    vi.mocked(signup).mockResolvedValue({
      status: 201,
      body: { token: "token-1", user: { id: "user-1", email: "user@example.com" } },
    });

    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);

    const requestInit = {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-idempotency-key": "signup-unique-1",
      },
      body: JSON.stringify({ email: "user@example.com", password: "password123" }),
    };

    await signupPost(new Request("http://localhost/api/auth/signup", requestInit));
    await signupPost(new Request("http://localhost/api/auth/signup", requestInit));

    const events = getLoggedEvents(infoSpy);
    const analyticsEvents = events.filter((entry) => entry.event === "analytics_event");
    const suppressedEvents = events.filter((entry) => entry.event === "analytics_duplicate_suppressed");

    expect(analyticsEvents).toHaveLength(1);
    expect(analyticsEvents[0]?.payload.event).toBe("sign_up");
    expect(suppressedEvents).toHaveLength(1);

    infoSpy.mockRestore();
  });
});
