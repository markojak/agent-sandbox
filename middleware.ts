import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { InMemoryRateLimiter } from "@/lib/rate-limit";

const authLimiter = new InMemoryRateLimiter(10, 60_000);
const logIngestLimiter = new InMemoryRateLimiter(60, 60_000);

function getRequestIdentifier(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export function middleware(request: NextRequest): NextResponse {
  const path = request.nextUrl.pathname;

  if (path.startsWith("/profile")) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (path.startsWith("/api/auth/")) {
    const result = authLimiter.consume(getRequestIdentifier(request));

    if (!result.allowed) {
      return NextResponse.json(
        { error: "Too many authentication attempts. Try again in a minute." },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((result.resetAt - Date.now()) / 1000).toString(),
          },
        },
      );
    }
  }

  if (path.startsWith("/api/logs/")) {
    const result = logIngestLimiter.consume(getRequestIdentifier(request));

    if (!result.allowed) {
      return NextResponse.json(
        { error: "Log ingestion rate limit exceeded." },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((result.resetAt - Date.now()) / 1000).toString(),
          },
        },
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/api/:path*"],
};
