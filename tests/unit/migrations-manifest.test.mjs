import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.join(__dirname, "..", "..", "db", "migrations");

test("migration directory includes forward/backward SQL for all versions", async () => {
  const entries = await fs.readdir(migrationsDir);

  const up = entries.filter((fileName) => fileName.endsWith("_up.sql")).sort();
  const down = entries.filter((fileName) => fileName.endsWith("_down.sql")).sort();

  assert.deepEqual(up, ["001_auth_profile_up.sql", "002_daily_rollups_up.sql"]);
  assert.deepEqual(down, ["001_auth_profile_down.sql", "002_daily_rollups_down.sql"]);
});
