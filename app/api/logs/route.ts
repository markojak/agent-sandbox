import { trackAnalyticsEvent, type CoreAnalyticsEvent } from "@/lib/observability/analytics";
import { withObservedRoute } from "@/lib/observability/route";

export const runtime = "nodejs";

const ACTION_TO_EVENT: Record<string, CoreAnalyticsEvent> = {
  create: "log_entry_create",
  edit: "log_entry_edit",
  delete: "log_entry_delete",
  reuse: "reuse_flow",
};

export const POST = withObservedRoute(async (request, context) => {
  const body = (await request.json()) as {
    action?: keyof typeof ACTION_TO_EVENT;
    entryId?: string;
    dedupeKey?: string;
    simulateFault?: boolean;
  };

  if (body.simulateFault) {
    throw new Error("Fault injection: /api/logs POST");
  }

  if (!body.action || !ACTION_TO_EVENT[body.action]) {
    return Response.json({ error: "Invalid action" }, { status: 400 });
  }

  const dedupeKey =
    body.dedupeKey ?? request.headers.get("x-idempotency-key") ?? `${context.requestId}:${body.action}`;

  const emitted = trackAnalyticsEvent({
    event: ACTION_TO_EVENT[body.action],
    requestId: context.requestId,
    userIdHash: context.userIdHash,
    dedupeKey,
    metadata: {
      entryId: body.entryId,
    },
  });

  return Response.json(
    {
      ok: true,
      requestId: context.requestId,
      analyticsEmitted: emitted,
    },
    { status: 200 },
  );
});
