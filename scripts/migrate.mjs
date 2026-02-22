import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Client } = pg;

const direction = process.argv[2] ?? "up";

if (!["up", "down"].includes(direction)) {
  throw new Error("Usage: node scripts/migrate.mjs [up|down]");
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.join(__dirname, "..", "db", "migrations");

async function listMigrationSqlPaths(targetDirection) {
  const entries = await fs.readdir(migrationsDir);
  const suffix = `_${targetDirection}.sql`;

  const files = entries
    .filter((fileName) => /^\d+_.+_(up|down)\.sql$/.test(fileName))
    .filter((fileName) => fileName.endsWith(suffix))
    .sort((a, b) => a.localeCompare(b, "en"));

  if (targetDirection === "down") {
    files.reverse();
  }

  return files.map((fileName) => path.join(migrationsDir, fileName));
}

const sqlPaths = await listMigrationSqlPaths(direction);
if (sqlPaths.length === 0) {
  throw new Error(`No migration files found for direction=${direction}`);
}

const client = new Client({ connectionString: databaseUrl });

await client.connect();
await client.query("BEGIN");

try {
  for (const sqlPath of sqlPaths) {
    const sql = await fs.readFile(sqlPath, "utf8");
    await client.query(sql);
  }

  await client.query("COMMIT");
  console.log(`migration ${direction} applied (${sqlPaths.length} files)`);
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
