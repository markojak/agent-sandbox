import { updateProfile } from "@/lib/server/auth-profile-service.mjs";
import { withObservedRoute } from "@/lib/observability/route";

export const PATCH = withObservedRoute(async (request) => {
  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.replace("Bearer ", "")
    : "";

  const body = await request.json();
  const result = await updateProfile(token, body);

  return Response.json(result.body, { status: result.status });
});
