import test from "node:test";
import assert from "node:assert/strict";
import { trackError, trackEvent } from "../../lib/server/observability.mjs";

test("trackEvent emits auth-profile events", () => {
  const event = trackEvent("signup_completed", { userId: 42 });

  assert.equal(event.domain, "auth-profile");
  assert.equal(event.event, "signup_completed");
  assert.equal(event.userId, 42);
});

test("trackError captures stable error payload", () => {
  const event = trackError("profile_update_failed", new Error("boom"));

  assert.equal(event.event, "profile_update_failed");
  assert.equal(event.errorName, "Error");
  assert.equal(event.errorMessage, "boom");
});
