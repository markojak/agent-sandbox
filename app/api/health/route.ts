import { NextResponse } from "next/server";
import { getPool } from "@/lib/server/db.mjs";
import { validateEnvironment } from "@/lib/env";

async function getDatabaseDependencyStatus() {
  if (!process.env.DATABASE_URL) {
    return {
      status: "missing",
      error: "DATABASE_URL is not configured.",
    };
  }

  try {
    const pool = getPool();
    await pool.query("SELECT 1");

    return {
      status: "ready",
      error: null,
    };
  } catch {
    return {
      status: "unreachable",
      error: "Database connectivity check failed.",
    };
  }
}

export async function GET() {
  const envValidation = validateEnvironment(process.env);
  const databaseDependency = await getDatabaseDependencyStatus();

  const checks = [...envValidation.errors];
  if (databaseDependency.error) {
    checks.push(databaseDependency.error);
  }

  const dependencies = {
    environment: envValidation.ok ? "ready" : "misconfigured",
    database: databaseDependency.status,
  };

  const ready = envValidation.ok && databaseDependency.status === "ready";

  return NextResponse.json(
    {
      status: ready ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      dependencies,
      checks,
    },
    { status: ready ? 200 : 503 },
  );
}
