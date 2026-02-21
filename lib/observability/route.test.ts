import { describe, expect, it, vi } from "vitest";

import { withObservedRoute } from "@/lib/observability/route";

describe("withObservedRoute", () => {
  it("adds request id header and logs request", async () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);

    const handler = withObservedRoute(async () => Response.json({ ok: true }, { status: 201 }));

    const response = await handler(
      new Request("http://localhost/api/logs", {
        method: "POST",
        headers: {
          "x-request-id": "req-123",
          "x-user-id": "user-123",
        },
      }),
    );

    expect(response.status).toBe(201);
    expect(response.headers.get("x-request-id")).toBe("req-123");
    expect(infoSpy).toHaveBeenCalledTimes(1);

    infoSpy.mockRestore();
  });

  it("captures errors and returns 500", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const handler = withObservedRoute(async () => {
      throw new Error("boom");
    });

    const response = await handler(new Request("http://localhost/api/logs", { method: "POST" }));

    expect(response.status).toBe(500);
    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
  });
});
