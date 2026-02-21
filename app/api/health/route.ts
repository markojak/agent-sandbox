import { NextResponse } from "next/server";
import { validateEnvironment } from "@/lib/env";

export async function GET() {
  const envValidation = validateEnvironment(process.env);

  const dependencies = {
    environment: envValidation.ok ? "ready" : "misconfigured",
    database: process.env.DATABASE_URL ? "configured" : "missing",
  };

  const ready = envValidation.ok;

  return NextResponse.json(
    {
      status: ready ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      dependencies,
      checks: envValidation.errors,
    },
    { status: ready ? 200 : 503 },
  );
}
