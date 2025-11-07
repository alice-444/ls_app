import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export type AuthenticatedRequest = NextRequest & {
  session: Awaited<ReturnType<typeof auth.api.getSession>>;
  userId: string;
};

export async function getAuthenticatedSession(
  req: NextRequest
): Promise<
  | { ok: true; session: AuthenticatedRequest["session"]; userId: string }
  | { ok: false; response: NextResponse }
> {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session?.user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return {
    ok: true,
    session,
    userId: session.user.id,
  };
}
