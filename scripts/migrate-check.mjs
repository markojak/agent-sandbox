#!/usr/bin/env node
import { readdir } from "node:fs/promises";

const migrationDirectory = new URL("../db/migrations", import.meta.url);
const isDryRun = process.argv.includes("--dry-run") || process.env.DRY_RUN === "true";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required before running migration checks.");
  process.exit(1);
}

let migrations = [];

try {
  const files = await readdir(migrationDirectory, { withFileTypes: true });
  migrations = files
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => entry.name)
    .sort();
} catch {
  migrations = [];
}

console.log(`Migration check (${isDryRun ? "dry-run" : "standard"})`);
console.log(`Detected ${migrations.length} SQL migration(s).`);

if (migrations.length > 0) {
  console.log(`Latest migration: ${migrations[migrations.length - 1]}`);
}
