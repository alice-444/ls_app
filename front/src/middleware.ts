import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/help",
  "/legal",
  "/terms",
  "/privacy",
  "/info",
  "/mentors",
  "/monitoring",
];

import { auth } from "@/lib/auth-server";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/help",
  "/legal",
  "/terms",
  "/privacy",
  "/info",
  "/mentors",
  "/monitoring",
];

async function checkSession(request: NextRequest): Promise<boolean> {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    return !!session?.user;
  } catch (error) {
    console.error("[middleware] Session check failed:", error);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // EXCLUSION CRITIQUE : Ne pas interférer avec Socket.IO
  if (pathname.startsWith("/socket.io")) {
    return NextResponse.next();
  }

  // Handle CORS
  const origin = request.headers.get("origin") || "";
  const response = NextResponse.next();
  
  // Add CORS headers to all responses
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Allow-Origin", origin || "*");
  response.headers.set("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS,PUT,PATCH");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-TRPC-Source, X-Requested-With, Accept, Sentry-Trace, baggage");

  // Handle preflight OPTIONS requests directly
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: response.headers,
    });
  }

  // Ignorer les routes techniques
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/trpc") ||
    pathname.includes(".")
  ) {
    return response;
  }

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));

  // Si c'est une route publique, laisser passer
  if (isPublicRoute) {
    return response;
  }

  // Pour les routes protégées, vérifier la session côté serveur
  const isAuthenticated = await checkSession(request);

  if (!isAuthenticated) {
    // Try alternative method: check if any session cookie exists
    const hasAnyCookie = request.cookies.getAll().length > 0;

    // Si on a au moins un cookie, on laisse passer (on laisse le client vérifier)
    if (hasAnyCookie) {
      return response;
    }

    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Intercepte tout sauf les assets et les routes techniques
     */
    "/((?!api|trpc|socket.io|_next/static|_next/image|favicon.ico|logo|bg|typo|monitoring).*)",
  ],
};
