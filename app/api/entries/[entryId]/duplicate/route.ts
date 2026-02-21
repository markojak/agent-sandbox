import { requireUserId } from "@/lib/request-user";
import { duplicateEntry } from "@/lib/reuse-store";
import { NextResponse } from "next/server";

type Context = {
  params: Promise<{ entryId: string }>;
};

export async function POST(request: Request, context: Context) {
  const auth = requireUserId(request);
  if ("response" in auth) {
    return auth.response;
  }

  const { entryId } = await context.params;
  const body = await request.json().catch(() => ({}));
  const mode = body?.mode === "immediate" ? "immediate" : "draft";

  const duplicatedEntry = duplicateEntry(auth.userId, entryId, mode);
  if (!duplicatedEntry) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  return NextResponse.json({ entry: duplicatedEntry }, { status: 201 });
}
