import { beforeEach, describe, expect, it } from "vitest";

import { signInWithPassword, signUpWithPassword, updateProfileForUser } from "@/lib/auth/service";
import {
  findProfileByUserId,
  removeProfileForUserIdForTests,
  resetInMemoryAuthStoreForTests,
} from "@/lib/auth/store";

describe("auth + profile vertical slice", () => {
  beforeEach(() => {
    resetInMemoryAuthStoreForTests();
  });

  it("creates profile on signup", async () => {
    const created = await signUpWithPassword({
      email: "new-user@example.com",
      password: "password123",
    });

    expect(created.ok).toBe(true);
    if (!created.ok) {
      return;
    }

    const profile = findProfileByUserId(created.value.userId);
    expect(profile).not.toBeNull();
    expect(profile?.calorieGoal).toBe(2200);
  });

  it("creates missing profile on first login", async () => {
    const created = await signUpWithPassword({
      email: "returning@example.com",
      password: "password123",
    });

    expect(created.ok).toBe(true);
    if (!created.ok) {
      return;
    }

    removeProfileForUserIdForTests(created.value.userId);

    const signedIn = await signInWithPassword({
      email: "returning@example.com",
      password: "password123",
    });

    expect(signedIn.ok).toBe(true);
    if (!signedIn.ok) {
      return;
    }

    const profile = findProfileByUserId(signedIn.value.userId);
    expect(profile).not.toBeNull();
  });

  it("surfaces validation errors for invalid profile payload", async () => {
    const created = await signUpWithPassword({
      email: "profile@example.com",
      password: "password123",
    });

    expect(created.ok).toBe(true);
    if (!created.ok) {
      return;
    }

    const updated = await updateProfileForUser(created.value.userId, {
      timezone: "Not/AZone",
      units: "unknown",
      calorieGoal: "abc",
    });

    expect(updated.ok).toBe(false);
    if (updated.ok) {
      return;
    }

    expect(updated.fieldErrors).toBeDefined();
    expect(updated.fieldErrors?.length).toBeGreaterThan(0);
  });
});
