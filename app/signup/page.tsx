import Link from "next/link";

import { signUpAction } from "@/app/actions";
import { oauthEnabled } from "@/lib/config";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-4 px-6">
      <h1 className="text-2xl font-semibold">Create account</h1>
      {params.error ? <p className="rounded bg-red-100 p-3 text-sm text-red-700">{params.error}</p> : null}

      <form action={signUpAction} className="flex flex-col gap-3 rounded border border-zinc-200 p-4">
        <label className="text-sm">
          Email
          <input required className="mt-1 w-full rounded border border-zinc-300 p-2" name="email" type="email" />
        </label>
        <label className="text-sm">
          Password
          <input
            required
            minLength={8}
            className="mt-1 w-full rounded border border-zinc-300 p-2"
            name="password"
            type="password"
          />
        </label>
        <button className="rounded bg-black p-2 text-white" type="submit">
          Sign up
        </button>
      </form>

      {oauthEnabled() ? (
        <Link className="text-sm text-blue-600 underline" href="/auth/oauth/github">
          Continue with GitHub (scaffold)
        </Link>
      ) : null}

      <p className="text-sm text-zinc-600">
        Already have an account? <Link className="underline" href="/login">Sign in</Link>
      </p>
    </main>
  );
}
