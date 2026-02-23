import { requireUserId } from "@/lib/request-user";
import { listRecents } from "@/lib/reuse-store";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = requireUserId(request);
  if ("response" in auth) {
    return auth.response;
  }

  const searchParams = new URL(request.url).searchParams;
  const limitParam = searchParams.get("limit");
  const offsetParam = searchParams.get("offset");
  const limit = limitParam ? Number(limitParam) : 5;
  const offset = offsetParam ? Number(offsetParam) : 0;

  return NextResponse.json({
    recents: listRecents(
      auth.userId,
      Number.isFinite(limit) ? limit : 5,
      Number.isFinite(offset) && offset > 0 ? Math.floor(offset) : 0,
    ),
  });
}
