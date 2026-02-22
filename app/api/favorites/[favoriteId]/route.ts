import { requireUserId } from "@/lib/request-user";
import { removeFavorite } from "@/lib/reuse-store";
import { NextResponse } from "next/server";

type Context = {
  params: Promise<{ favoriteId: string }>;
};

export async function DELETE(request: Request, context: Context) {
  const auth = requireUserId(request);
  if ("response" in auth) {
    return auth.response;
  }

  const { favoriteId } = await context.params;
  const removed = removeFavorite(auth.userId, favoriteId);
  if (!removed) {
    return NextResponse.json({ error: "Favorite not found" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
