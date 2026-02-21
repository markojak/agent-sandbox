"use server";

import { redirect } from "next/navigation";

import { signInWithPassword, signUpWithPassword, updateProfileForUser } from "@/lib/auth/service";
import { clearUserSession, createUserSession, getSessionUser } from "@/lib/auth/session";

function errorRedirect(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function signUpAction(formData: FormData): Promise<void> {
  const result = await signUpWithPassword({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (!result.ok) {
    return errorRedirect("/signup", result.error);
  }

  await createUserSession(result.value.userId);
  redirect("/profile");
}

export async function signInAction(formData: FormData): Promise<void> {
  const nextPath = String(formData.get("next") ?? "/profile");

  const result = await signInWithPassword({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (!result.ok) {
    return errorRedirect("/login", result.error);
  }

  await createUserSession(result.value.userId);
  redirect(nextPath.startsWith("/") ? nextPath : "/profile");
}

export async function signOutAction(): Promise<void> {
  await clearUserSession();
  redirect("/login");
}

export async function updateProfileAction(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const result = await updateProfileForUser(user.id, {
    timezone: formData.get("timezone"),
    units: formData.get("units"),
    calorieGoal: formData.get("calorieGoal"),
  });

  if (!result.ok) {
    return errorRedirect("/profile", result.fieldErrors?.join(" ") ?? result.error);
  }

  redirect("/profile?updated=1");
}
