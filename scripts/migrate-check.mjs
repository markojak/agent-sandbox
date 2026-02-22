#!/usr/bin/env node
import { readdir } from "node:fs/promises";
import pg from "pg";
import { isForwardMigration } from "./migration-utils.mjs";

const { Client } = pg;
const migrationDirectory = new URL("../db/migrations", import.meta.url);
const isDryRun = process.argv.includes("--dry-run") || process.env.DRY_RUN === "true";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required before running migration checks.");
  process.exit(1);
}

let files = [];

try {
  files = await readdir(migrationDirectory, { withFileTypes: true });
} catch {
  files = [];
}

const allSqlMigrations = files
  .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
  .map((entry) => entry.name)
  .sort();

const forwardMigrations = allSqlMigrations.filter(isForwardMigration);

console.log(`Migration check (${isDryRun ? "dry-run" : "standard"})`);
console.log(`Detected ${forwardMigrations.length} forward SQL migration(s).`);

if (forwardMigrations.length > 0) {
  console.log(`Latest forward migration: ${forwardMigrations[forwardMigrations.length - 1]}`);
}

const excludedMigrations = allSqlMigrations.filter((migration) => !isForwardMigration(migration));
if (excludedMigrations.length > 0) {
  console.log(`Excluded rollback/down migration(s): ${excludedMigrations.join(", ")}`);
}

if (isDryRun) {
  console.log("Dry-run mode: skipping database connectivity checks.");
  process.exit(0);
}

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

try {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const appliedResult = await client.query("SELECT name FROM schema_migrations");
  const applied = new Set(appliedResult.rows.map((row) => row.name));
  const pending = forwardMigrations.filter((migration) => !applied.has(migration));

  console.log(`Applied migrations: ${applied.size}`);
  console.log(`Pending migrations: ${pending.length}`);

  if (pending.length > 0) {
    console.log(`Next pending migration: ${pending[0]}`);
  }
} finally {
  await client.end();
}
