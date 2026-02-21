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
const sqlPath = path.join(
  __dirname,
  "..",
  "db",
  "migrations",
  `001_auth_profile_${direction}.sql`,
);

const sql = await fs.readFile(sqlPath, "utf8");
const client = new Client({ connectionString: databaseUrl });

await client.connect();
await client.query("BEGIN");

try {
  await client.query(sql);
  await client.query("COMMIT");
  console.log(`migration ${direction} applied`);
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
