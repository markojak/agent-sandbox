import { Pool } from "pg";

const globalForDb = globalThis;

export function getPool() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const pool =
    globalForDb.__authProfilePool ??
    new Pool({
      connectionString: databaseUrl,
      max: 10,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__authProfilePool = pool;
  }

  return pool;
}
