import { requireUserId } from "@/lib/request-user";
import { listRecents } from "@/lib/reuse-store";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = requireUserId(request);
  if ("response" in auth) {
    return auth.response;
  }

  const limitParam = new URL(request.url).searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : 5;

  return NextResponse.json({
    recents: listRecents(auth.userId, Number.isFinite(limit) ? limit : 5),
  });
}
