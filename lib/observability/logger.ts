import { redactValue } from "@/lib/observability/redaction";

type LogLevel = "info" | "warn" | "error";

type LogEnvelope = {
  ts: string;
  env: string;
  release: string;
  level: LogLevel;
  event: string;
  payload: unknown;
};

function getEnvironment(): string {
  return process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development";
}

function getRelease(): string {
  return process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.RELEASE_VERSION ?? "local";
}

export function buildLogEnvelope(level: LogLevel, event: string, payload: unknown): LogEnvelope {
  return {
    ts: new Date().toISOString(),
    env: getEnvironment(),
    release: getRelease(),
    level,
    event,
    payload: redactValue(payload),
  };
}

export function logEvent(level: LogLevel, event: string, payload: unknown): void {
  const envelope = buildLogEnvelope(level, event, payload);
  const line = JSON.stringify(envelope);

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.info(line);
}
