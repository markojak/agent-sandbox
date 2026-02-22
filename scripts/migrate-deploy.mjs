#!/usr/bin/env node
import { readdir, readFile } from "node:fs/promises";
import pg from "pg";
import { isForwardMigration } from "./migration-utils.mjs";

const { Client } = pg;
const migrationDirectory = new URL("../db/migrations", import.meta.url);

async function getForwardMigrations() {
  const files = await readdir(migrationDirectory, { withFileTypes: true });

  return files
    .filter((entry) => entry.isFile() && isForwardMigration(entry.name))
    .map((entry) => entry.name)
    .sort();
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required before deploying migrations.");
  process.exit(1);
}

const migrations = await getForwardMigrations();

if (migrations.length === 0) {
  console.log("No forward migrations found. Nothing to deploy.");
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
  const pending = migrations.filter((migration) => !applied.has(migration));

  if (pending.length === 0) {
    console.log("All forward migrations are already applied.");
    process.exit(0);
  }

  console.log(`Applying ${pending.length} pending migration(s):`);

  for (const migration of pending) {
    const sql = await readFile(new URL(`../db/migrations/${migration}`, import.meta.url), "utf8");

    console.log(`- applying ${migration}`);

    await client.query("BEGIN");

    try {
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [migration]);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw new Error(`Failed to apply migration ${migration}: ${error.message}`);
    }
  }

  console.log("Migration deployment completed.");
} finally {
  await client.end();
}
