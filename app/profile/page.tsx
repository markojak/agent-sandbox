import { signOutAction, updateProfileAction } from "@/app/actions";
import { getOrCreateProfile } from "@/lib/auth/service";
import { getSessionUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; updated?: string }>;
}) {
  const params = await searchParams;
  const user = await getSessionUser();

  if (!user) {
    redirect("/login?next=/profile");
  }

  const profile = await getOrCreateProfile(user.id);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col gap-4 px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Profile settings</h1>
        <form action={signOutAction}>
          <button className="rounded border border-zinc-300 px-3 py-1 text-sm" type="submit">
            Sign out
          </button>
        </form>
      </div>

      <p className="text-sm text-zinc-600">Signed in as {user.email}</p>

      {params.error ? <p className="rounded bg-red-100 p-3 text-sm text-red-700">{params.error}</p> : null}
      {params.updated ? <p className="rounded bg-green-100 p-3 text-sm text-green-700">Profile updated.</p> : null}

      <form action={updateProfileAction} className="flex flex-col gap-3 rounded border border-zinc-200 p-4">
        <label className="text-sm">
          Timezone
          <input
            required
            className="mt-1 w-full rounded border border-zinc-300 p-2"
            name="timezone"
            defaultValue={profile.timezone}
          />
        </label>

        <label className="text-sm">
          Units
          <select className="mt-1 w-full rounded border border-zinc-300 p-2" name="units" defaultValue={profile.units}>
            <option value="imperial">Imperial (lb)</option>
            <option value="metric">Metric (kg)</option>
          </select>
        </label>

        <label className="text-sm">
          Daily calorie goal
          <input
            required
            min={800}
            max={8000}
            className="mt-1 w-full rounded border border-zinc-300 p-2"
            name="calorieGoal"
            type="number"
            defaultValue={profile.calorieGoal}
          />
        </label>

        <button className="rounded bg-black p-2 text-white" type="submit">
          Save profile
        </button>
      </form>
    </main>
  );
}
