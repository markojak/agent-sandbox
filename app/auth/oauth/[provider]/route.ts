import { NextResponse } from "next/server";

import { oauthEnabled } from "@/lib/config";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ provider: string }> },
): Promise<Response> {
  const { provider } = await params;

  if (!oauthEnabled()) {
    return NextResponse.json(
      { error: "OAuth is disabled. Set ENABLE_OAUTH=true to enable provider flows." },
      { status: 404 },
    );
  }

  return NextResponse.json(
    {
      error: `OAuth provider '${provider}' is not configured yet. This route is scaffolding for M1-C.`,
    },
    { status: 501 },
  );
}
