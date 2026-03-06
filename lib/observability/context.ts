import { createHash, randomUUID } from "node:crypto";

const REQUEST_ID_HEADER = "x-request-id";
const USER_ID_HEADER = "x-user-id";

function hashUserId(userId: string): string {
  const salt = process.env.OBSERVABILITY_USER_HASH_SALT ?? "dev-only-salt";
  return createHash("sha256").update(`${salt}:${userId}`).digest("hex").slice(0, 16);
}

export function getRequestId(request: Request): string {
  return request.headers.get(REQUEST_ID_HEADER) ?? randomUUID();
}

export function getUserIdHash(request: Request): string | null {
  const rawUserId = request.headers.get(USER_ID_HEADER);
  if (!rawUserId) {
    return null;
  }

  return hashUserId(rawUserId);
}
