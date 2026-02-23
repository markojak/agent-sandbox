import { requireUserId } from "@/lib/request-user";
import { DEFAULT_LIMIT, listRecents } from "@/lib/reuse-store";
import { NextResponse } from "next/server";

const getRecentLimit = (request: Request) => {
  const limitParam = new URL(request.url).searchParams.get("limit");
  if (!limitParam) {
    return DEFAULT_LIMIT;
  }

  const trimmed = limitParam.trim();
  if (!trimmed) {
    return DEFAULT_LIMIT;
  }

  const parsed = Number.parseInt(trimmed, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return DEFAULT_LIMIT;
  }

  return parsed;
};

export async function GET(request: Request) {
  const auth = requireUserId(request);
  if ("response" in auth) {
    return auth.response;
  }

  return NextResponse.json({
    recents: listRecents(auth.userId, getRecentLimit(request)),
  });
}
