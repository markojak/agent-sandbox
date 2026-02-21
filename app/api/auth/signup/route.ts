import { NextResponse } from "next/server";
import { signup } from "@/lib/server/auth-profile-service.mjs";

export async function POST(request: Request) {
  const body = await request.json();
  const result = await signup(body);

  return NextResponse.json(result.body, { status: result.status });
}
