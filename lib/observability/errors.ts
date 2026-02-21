import { logEvent } from "@/lib/observability/logger";

type ErrorContext = {
  requestId?: string;
  route?: string;
  method?: string;
  userIdHash?: string | null;
};

function normalizeError(error: unknown): { name: string; message: string; stack?: string } {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    name: "NonErrorThrown",
    message: typeof error === "string" ? error : "Unknown non-error throw",
  };
}

export async function captureError(error: unknown, context: ErrorContext = {}): Promise<void> {
  const normalized = normalizeError(error);

  logEvent("error", "unhandled_exception", {
    ...context,
    ...normalized,
  });

  const ingestUrl = process.env.ERROR_TRACKING_INGEST_URL;
  if (!ingestUrl) {
    return;
  }

  try {
    await fetch(ingestUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        env: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
        release: process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.RELEASE_VERSION ?? "local",
        context,
        error: normalized,
      }),
    });
  } catch (ingestError) {
    logEvent("warn", "error_tracking_ingest_failed", {
      requestId: context.requestId,
      reason: ingestError instanceof Error ? ingestError.message : "unknown",
    });
  }
}
