import { redirect } from "next/navigation";

import { TimelineView } from "@/components/timeline-view";
import { getOrCreateProfile } from "@/lib/auth/service";
import { getSessionUser } from "@/lib/auth/session";

export default async function TimelinePage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login?next=/timeline");
  }

  const profile = await getOrCreateProfile(user.id);

  return <TimelineView initialGoal={profile.calorieGoal} timezone={profile.timezone} />;
}
