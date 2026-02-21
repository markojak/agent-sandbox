import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  createUser,
  findProfileByUserId,
  findUserByEmail,
  type Profile,
  type Units,
  upsertProfile,
} from "@/lib/auth/store";
import { defaultProfileInput, validateProfileInput } from "@/lib/profile/validation";

export type AuthResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string; fieldErrors?: string[] };

export async function signUpWithPassword(input: {
  email: string;
  password: string;
}): Promise<AuthResult<{ userId: string }>> {
  const email = normalizeEmail(input.email);
  const password = input.password ?? "";

  if (!email.includes("@")) {
    return { ok: false, error: "Please provide a valid email." };
  }

  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }

  if (findUserByEmail(email)) {
    return { ok: false, error: "An account with this email already exists." };
  }

  const user = createUser({
    id: crypto.randomUUID(),
    email,
    passwordHash: hashPassword(password),
    createdAt: new Date(),
  });

  ensureProfile(user.id);

  return { ok: true, value: { userId: user.id } };
}

export async function signInWithPassword(input: {
  email: string;
  password: string;
}): Promise<AuthResult<{ userId: string }>> {
  const email = normalizeEmail(input.email);
  const user = findUserByEmail(email);

  if (!user || !verifyPassword(input.password ?? "", user.passwordHash)) {
    return { ok: false, error: "Invalid email or password." };
  }

  ensureProfile(user.id);

  return { ok: true, value: { userId: user.id } };
}

export async function getOrCreateProfile(userId: string): Promise<Profile> {
  return ensureProfile(userId);
}

export async function updateProfileForUser(
  userId: string,
  input: { timezone: unknown; units: unknown; calorieGoal: unknown },
): Promise<AuthResult<Profile>> {
  const parsed = validateProfileInput(input);

  if (!parsed.ok) {
    return {
      ok: false,
      error: "Profile validation failed.",
      fieldErrors: parsed.errors,
    };
  }

  const profile: Profile = {
    userId,
    timezone: parsed.value.timezone,
    units: parsed.value.units,
    calorieGoal: parsed.value.calorieGoal,
    updatedAt: new Date(),
  };

  upsertProfile(profile);

  return { ok: true, value: profile };
}

function ensureProfile(userId: string): Profile {
  const existing = findProfileByUserId(userId);
  if (existing) {
    return existing;
  }

  const defaults = defaultProfileInput();

  return upsertProfile({
    userId,
    timezone: defaults.timezone,
    units: defaults.units as Units,
    calorieGoal: defaults.calorieGoal,
    updatedAt: new Date(),
  });
}

function normalizeEmail(email: string): string {
  return (email ?? "").trim().toLowerCase();
}
