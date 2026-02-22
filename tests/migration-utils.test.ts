import { describe, expect, it } from "vitest";

import { isForwardMigration } from "@/scripts/migration-utils.mjs";

describe("migration utils", () => {
  it("includes forward migration files", () => {
    expect(isForwardMigration("0001_init.sql")).toBe(true);
    expect(isForwardMigration("001_auth_profile_up.sql")).toBe(true);
  });

  it("excludes rollback/down migration files", () => {
    expect(isForwardMigration("001_auth_profile_down.sql")).toBe(false);
    expect(isForwardMigration("002_users_rollback.sql")).toBe(false);
  });

  it("excludes non-sql files", () => {
    expect(isForwardMigration("README.md")).toBe(false);
  });
});
