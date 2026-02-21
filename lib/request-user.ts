import { NextResponse } from "next/server";

export const requireUserId = (request: Request) => {
  const userId = request.headers.get("x-user-id");

  if (!userId) {
    return {
      response: NextResponse.json(
        { error: "Missing x-user-id header for authenticated request" },
        { status: 401 },
      ),
    };
  }

  return { userId };
};
