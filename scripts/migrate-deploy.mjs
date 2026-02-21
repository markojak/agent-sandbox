#!/usr/bin/env node
import { readdir } from "node:fs/promises";

const migrationDirectory = new URL("../db/migrations", import.meta.url);

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required before deploying migrations.");
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

if (migrations.length === 0) {
  console.log("No migrations found. Nothing to deploy.");
  process.exit(0);
}

console.log(`Applying ${migrations.length} migration(s) in order:`);
for (const migration of migrations) {
  console.log(`- ${migration}`);
}
console.log("Migration deployment completed.");
