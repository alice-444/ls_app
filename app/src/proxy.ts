import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/help",
  "/faq",
  "/support-request",
  "/legal",
  "/terms",
  "/privacy",
  "/info",
  "/mentors",
  "/monitoring",
];

export async function proxy(request: NextRequest) {
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
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-TRPC-Source, X-Requested-With, Accept, Sentry-Trace, baggage",
  );

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

  // Pour les routes protégées, une vérification sommaire de la présence du cookie de session
  // Better Auth utilise par défaut 'better-auth.session_token'
  const sessionCookie =
    request.cookies.get("better-auth.session_token") || request.cookies.get("__Secure-better-auth.session_token");

  if (!sessionCookie) {
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
    "/((?!api|trpc|socket.io|_next/static|_next/image|logo|bg|typo|monitoring).*)",
  ],
};
