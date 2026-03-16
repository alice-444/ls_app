import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Utiliser better-auth pour vérifier la session depuis les cookies
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (session?.user) {
      return Response.json({ authenticated: true, user: session.user });
    }

    return Response.json({ authenticated: false });
  } catch (error) {
    console.error("[/api/auth/session] Error:", error);
    return Response.json({ authenticated: false });
  }
}
