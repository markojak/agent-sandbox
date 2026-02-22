import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-log-token");
  const expectedToken = process.env.LOG_INGEST_TOKEN;

  if (!expectedToken || token !== expectedToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ accepted: true }, { status: 202 });
}
