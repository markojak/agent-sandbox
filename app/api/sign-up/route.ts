import { trackAnalyticsEvent } from "@/lib/observability/analytics";
import { withObservedRoute } from "@/lib/observability/route";

export const runtime = "nodejs";

export const POST = withObservedRoute(async (request, context) => {
  const body = (await request.json()) as { dedupeKey?: string };

  const dedupeKey =
    body.dedupeKey ?? request.headers.get("x-idempotency-key") ?? `${context.requestId}:sign-up`;

  const emitted = trackAnalyticsEvent({
    event: "sign_up",
    requestId: context.requestId,
    userIdHash: context.userIdHash,
    dedupeKey,
  });

  return Response.json({ ok: true, analyticsEmitted: emitted, requestId: context.requestId }, { status: 200 });
});
