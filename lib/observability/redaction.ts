const REDACTED = "[REDACTED]";

const SENSITIVE_KEY_PATTERN = /password|passphrase|secret|token|api[-_]?key|authorization|cookie|session|note|notes/i;

function shouldRedactKey(key: string): boolean {
  return SENSITIVE_KEY_PATTERN.test(key);
}

export function redactValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => redactValue(entry));
  }

  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>(
      (acc, [key, entry]) => {
        acc[key] = shouldRedactKey(key) ? REDACTED : redactValue(entry);
        return acc;
      },
      {},
    );
  }

  return value;
}

export { REDACTED };
