import { describe, expect, it } from "vitest";

import { REDACTED, redactValue } from "@/lib/observability/redaction";

describe("redactValue", () => {
  it("redacts sensitive keys recursively", () => {
    const result = redactValue({
      password: "secret",
      profile: {
        notes: "private text",
        nested: {
          apiKey: "abc",
        },
      },
      safe: "ok",
    }) as Record<string, unknown>;

    expect(result.password).toBe(REDACTED);
    expect((result.profile as Record<string, unknown>).notes).toBe(REDACTED);
    expect(((result.profile as Record<string, unknown>).nested as Record<string, unknown>).apiKey).toBe(REDACTED);
    expect(result.safe).toBe("ok");
  });
});
