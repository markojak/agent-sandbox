import Link from "next/link";

import { getSessionUser } from "@/lib/auth/session";

export default async function Home() {
  const user = await getSessionUser();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold">ShardCode Calorie Tracker</h1>
      <p className="text-zinc-700">M1 auth + profile vertical slice.</p>

      {user ? (
        <div className="rounded border border-zinc-200 p-4">
          <p className="mb-3 text-sm text-zinc-600">Signed in as {user.email}</p>
          <Link className="text-blue-600 underline" href="/profile">
            Go to profile settings
          </Link>
        </div>
      ) : (
        <div className="rounded border border-zinc-200 p-4">
          <p className="mb-3 text-sm text-zinc-600">You are signed out.</p>
          <div className="flex gap-4">
            <Link className="text-blue-600 underline" href="/login">
              Log in
            </Link>
            <Link className="text-blue-600 underline" href="/signup">
              Create account
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
