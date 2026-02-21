import pg from "pg";
import { execFileSync } from "node:child_process";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const { Client } = pg;

function runMigrate(direction) {
  execFileSync("node", ["scripts/migrate.mjs", direction], {
    stdio: "inherit",
    env: process.env,
  });
}

async function tableExists(client, tableName) {
  const result = await client.query(
    `SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = $1
    ) AS exists`,
    [tableName],
  );

  return result.rows[0].exists;
}

const client = new Client({ connectionString: databaseUrl });
await client.connect();

try {
  runMigrate("up");

  for (const tableName of ["users", "profiles", "auth_sessions"]) {
    if (!(await tableExists(client, tableName))) {
      throw new Error(`expected table ${tableName} after up migration`);
    }
  }

  runMigrate("down");

  for (const tableName of ["users", "profiles", "auth_sessions"]) {
    if (await tableExists(client, tableName)) {
      throw new Error(`table ${tableName} should be dropped by down migration`);
    }
  }

  runMigrate("up");
  console.log("forward/backward migration verification passed");
} finally {
  await client.end();
}
