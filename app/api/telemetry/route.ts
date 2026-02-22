import { requireUserId } from "@/lib/request-user";
import { listTelemetryEvents } from "@/lib/reuse-store";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = requireUserId(request);
  if ("response" in auth) {
    return auth.response;
  }

  return NextResponse.json({ events: listTelemetryEvents(auth.userId) });
}
