export type Units = "metric" | "imperial";

export type User = {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
};

export type Profile = {
  userId: string;
  timezone: string;
  units: Units;
  calorieGoal: number;
  updatedAt: Date;
};

const usersByEmail = new Map<string, User>();
const usersById = new Map<string, User>();
const profilesByUserId = new Map<string, Profile>();
const sessionsById = new Map<string, string>();

export function createUser(user: User): User {
  usersByEmail.set(user.email, user);
  usersById.set(user.id, user);
  return user;
}

export function findUserByEmail(email: string): User | null {
  return usersByEmail.get(email) ?? null;
}

export function findUserById(id: string): User | null {
  return usersById.get(id) ?? null;
}

export function upsertProfile(profile: Profile): Profile {
  profilesByUserId.set(profile.userId, profile);
  return profile;
}

export function findProfileByUserId(userId: string): Profile | null {
  return profilesByUserId.get(userId) ?? null;
}

export function createSession(userId: string): string {
  const sessionId = crypto.randomUUID();
  sessionsById.set(sessionId, userId);
  return sessionId;
}

export function findUserIdBySessionId(sessionId: string): string | null {
  return sessionsById.get(sessionId) ?? null;
}

export function deleteSession(sessionId: string): void {
  sessionsById.delete(sessionId);
}

export function removeProfileForUserIdForTests(userId: string): void {
  profilesByUserId.delete(userId);
}

export function resetInMemoryAuthStoreForTests(): void {
  usersByEmail.clear();
  usersById.clear();
  profilesByUserId.clear();
  sessionsById.clear();
}
