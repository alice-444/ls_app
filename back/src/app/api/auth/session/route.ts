import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    console.log(`[/api/auth/session] Incoming request`);
    console.log(
      `[/api/auth/session] Cookie header: ${cookieHeader ? `[${cookieHeader.split(";").length} cookies]` : "NONE"}`,
    );
    console.log(`[/api/auth/session] Full cookie: ${cookieHeader}`);

    // Utiliser better-auth pour vérifier la session depuis les cookies
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    console.log(`[/api/auth/session] Session result:`, session);

    if (session?.user) {
      console.log(`[/api/auth/session] User found: ${session.user.email}`);
      return Response.json({ authenticated: true, user: session.user });
    }

    console.log(`[/api/auth/session] No user session found`);
    return Response.json({ authenticated: false });
  } catch (error) {
    console.error("[/api/auth/session] Error:", error);
    return Response.json({ authenticated: false, error: String(error) });
  }
}
