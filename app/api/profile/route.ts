import { NextResponse } from "next/server";
import { updateProfile } from "@/lib/server/auth-profile-service.mjs";

export async function PATCH(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.replace("Bearer ", "")
    : "";

  const body = await request.json();
  const result = await updateProfile(token, body);

  return NextResponse.json(result.body, { status: result.status });
}
