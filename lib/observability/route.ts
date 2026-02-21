import { captureError } from "@/lib/observability/errors";
import { getRequestId, getUserIdHash } from "@/lib/observability/context";
import { logEvent } from "@/lib/observability/logger";

export type ObservabilityContext = {
  requestId: string;
  userIdHash: string | null;
};

type RouteHandler = (request: Request, context: ObservabilityContext) => Promise<Response>;

function measureLatency(start: number): number {
  const end = typeof performance !== "undefined" ? performance.now() : Date.now();
  return Math.round((end - start) * 100) / 100;
}

export function withObservedRoute(handler: RouteHandler): (request: Request) => Promise<Response> {
  return async function observedRoute(request: Request): Promise<Response> {
    const start = typeof performance !== "undefined" ? performance.now() : Date.now();
    const requestId = getRequestId(request);
    const userIdHash = getUserIdHash(request);
    const url = new URL(request.url);

    try {
      const response = await handler(request, { requestId, userIdHash });
      const latencyMs = measureLatency(start);

      logEvent("info", "api_request", {
        requestId,
        userIdHash,
        method: request.method,
        route: url.pathname,
        status: response.status,
        latencyMs,
      });

      response.headers.set("x-request-id", requestId);
      return response;
    } catch (error) {
      const latencyMs = measureLatency(start);

      await captureError(error, {
        requestId,
        userIdHash,
        method: request.method,
        route: url.pathname,
      });

      logEvent("error", "api_request", {
        requestId,
        userIdHash,
        method: request.method,
        route: url.pathname,
        status: 500,
        latencyMs,
      });

      return Response.json(
        {
          error: "Internal server error",
          requestId,
        },
        {
          status: 500,
          headers: {
            "x-request-id": requestId,
          },
        },
      );
    }
  };
}
