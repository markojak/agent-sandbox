import { parseEntryInput } from "@/lib/entry-validation";
import { requireUserId } from "@/lib/request-user";
import { createEntry, listEntries } from "@/lib/reuse-store";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = requireUserId(request);
  if ("response" in auth) {
    return auth.response;
  }

  return NextResponse.json({ entries: listEntries(auth.userId) });
}

export async function POST(request: Request) {
  const auth = requireUserId(request);
  if ("response" in auth) {
    return auth.response;
  }

  const body = await request.json();
  const parsed = parseEntryInput(body);
  if (parsed.error || !parsed.data) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const source =
    body?.source === "favorite" || body?.source === "recent"
      ? body.source
      : undefined;
  const entry = createEntry(auth.userId, parsed.data, source);

  return NextResponse.json({ entry }, { status: 201 });
}
