import { cookies } from "next/headers";

import {
  createSession,
  deleteSession,
  findUserById,
  findUserIdBySessionId,
  type User,
} from "@/lib/auth/store";

export const SESSION_COOKIE_NAME = "shard_session";

const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

export async function createUserSession(userId: string): Promise<void> {
  const sessionId = createSession(userId);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, SESSION_COOKIE_OPTIONS);
}

export async function clearUserSession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionId) {
    deleteSession(sessionId);
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSessionUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionId) {
    return null;
  }

  const userId = findUserIdBySessionId(sessionId);
  if (!userId) {
    return null;
  }

  return findUserById(userId);
}
