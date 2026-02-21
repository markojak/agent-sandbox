import { logEvent } from "@/lib/observability/logger";

export const CORE_ANALYTICS_EVENTS = [
  "sign_up",
  "log_entry_create",
  "log_entry_edit",
  "log_entry_delete",
  "reuse_flow",
] as const;

export type CoreAnalyticsEvent = (typeof CORE_ANALYTICS_EVENTS)[number];

const dedupeCache = new Set<string>();

export function clearAnalyticsDedupeCache(): void {
  dedupeCache.clear();
}

export function trackAnalyticsEvent(params: {
  event: CoreAnalyticsEvent;
  requestId: string;
  userIdHash: string | null;
  dedupeKey: string;
  metadata?: Record<string, unknown>;
}): boolean {
  if (dedupeCache.has(params.dedupeKey)) {
    logEvent("info", "analytics_duplicate_suppressed", {
      event: params.event,
      requestId: params.requestId,
      userIdHash: params.userIdHash,
      dedupeKey: params.dedupeKey,
    });
    return false;
  }

  dedupeCache.add(params.dedupeKey);

  logEvent("info", "analytics_event", {
    event: params.event,
    requestId: params.requestId,
    userIdHash: params.userIdHash,
    dedupeKey: params.dedupeKey,
    metadata: params.metadata ?? {},
  });

  return true;
}
