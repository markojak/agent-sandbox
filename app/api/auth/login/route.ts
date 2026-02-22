import { login } from "@/lib/server/auth-profile-service.mjs";
import { withObservedRoute } from "@/lib/observability/route";

export const POST = withObservedRoute(async (request) => {
  const body = await request.json();
  const result = await login(body);

  return Response.json(result.body, { status: result.status });
});
