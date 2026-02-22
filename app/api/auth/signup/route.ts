import { signup } from "@/lib/server/auth-profile-service.mjs";
import { trackAnalyticsEvent } from "@/lib/observability/analytics";
import { withObservedRoute } from "@/lib/observability/route";

export const POST = withObservedRoute(async (request, context) => {
  const body = await request.json();
  const result = await signup(body);

  if (result.status === 201) {
    const dedupeKey =
      request.headers.get("x-idempotency-key") ?? `${context.requestId}:sign_up:${result.body?.user?.id ?? "unknown"}`;

    trackAnalyticsEvent({
      event: "sign_up",
      requestId: context.requestId,
      userIdHash: context.userIdHash,
      dedupeKey,
    });
  }

  return Response.json(result.body, { status: result.status });
});
