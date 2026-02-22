import { requireUserId } from "@/lib/request-user";
import { addFavoriteFromEntry, listFavorites } from "@/lib/reuse-store";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = requireUserId(request);
  if ("response" in auth) {
    return auth.response;
  }

  return NextResponse.json({ favorites: listFavorites(auth.userId) });
}

export async function POST(request: Request) {
  const auth = requireUserId(request);
  if ("response" in auth) {
    return auth.response;
  }

  const body = await request.json();
  const entryId = typeof body?.entryId === "string" ? body.entryId : null;

  if (!entryId) {
    return NextResponse.json({ error: "entryId is required" }, { status: 400 });
  }

  const favorite = addFavoriteFromEntry(auth.userId, entryId);
  if (!favorite) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  return NextResponse.json({ favorite }, { status: 201 });
}
