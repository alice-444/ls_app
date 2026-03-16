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

// Pour le middleware (server-side), utiliser l'URL interne Docker
const INTERNAL_API_URL = process.env.INTERNAL_API_URL || "http://backend:4500";

async function checkSession(request: NextRequest): Promise<boolean> {
  try {
    // Récupérer les cookies depuis la requête
    const cookieHeader = request.headers.get("cookie") || "";
    const pathname = request.nextUrl.pathname;

    console.log(`[middleware] Checking session for ${pathname}`);
    console.log(`[middleware] Cookie header: ${cookieHeader ? `[${cookieHeader.split(";").length} cookies]` : "NONE"}`);

    // Afficher les cookies individuels
    const cookies = request.cookies.getAll();
    if (cookies.length > 0) {
      console.log(
        `[middleware] Cookies detected:`,
        cookies.map((c) => c.name),
      );
    } else {
      console.log(`[middleware] No cookies detected`);
    }

    // Appeler le backend pour vérifier la session
    console.log(`[middleware] Calling ${INTERNAL_API_URL}/api/auth/session`);
    const response = await fetch(`${INTERNAL_API_URL}/api/auth/session`, {
      method: "GET",
      headers: {
        host: "api.learnsup.fr", // Indispensable pour que Better Auth reconnaisse le domaine
        cookie: cookieHeader,
        "x-forwarded-host": "api.learnsup.fr",
        "x-forwarded-proto": request.headers.get("x-forwarded-proto") || "https",
        "x-forwarded-for": request.headers.get("x-forwarded-for") || "",
      },
    });

    console.log(`[middleware] Backend response status: ${response.status}`);
    const data = await response.json();
    console.log(`[middleware] Backend response:`, data);

    const isAuth = data.authenticated === true;
    console.log(`[middleware] Session valid: ${isAuth}`);

    return isAuth;
  } catch (error) {
    console.error("[middleware] Session check failed:", error);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log(`[middleware] Incoming request: ${pathname}`);
  console.log("[middleware] All headers:", Object.fromEntries(request.headers.entries()));

  // Ignorer les routes techniques et Socket.IO
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/trpc") ||
    pathname.startsWith("/socket.io") ||
    pathname.includes(".")
  ) {
    console.log(`[middleware] Bypassing technical route: ${pathname}`);
    return NextResponse.next();
  }

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));

  // Si c'est une route publique, laisser passer
  if (isPublicRoute) {
    console.log(`[middleware] Public route allowed: ${pathname}`);
    return NextResponse.next();
  }

  // Pour les routes protégées, vérifier la session côté serveur
  console.log(`[middleware] Protected route, checking session: ${pathname}`);
  const isAuthenticated = await checkSession(request);

  if (!isAuthenticated) {
    // Try alternative method: check if any session cookie exists
    const cookies = request.cookies.getAll();
    const hasAnyCookie = cookies.length > 0;

    console.log(`[middleware] Alternative check - any cookies present: ${hasAnyCookie}`);
    console.log(`[middleware] All cookies: ${JSON.stringify(cookies.map((c) => c.name))}`);

    // Si on a au moins un cookie, on laisse passer (on laisse le client vérifier)
    if (hasAnyCookie) {
      console.log(`[middleware] Cookies detected, allowing request (client will verify)`);
      return NextResponse.next();
    }

    console.log(`[middleware] User not authenticated, redirecting to /login from ${pathname}`);
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  console.log(`[middleware] User authenticated, allowing access to ${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Intercepte tout sauf les assets et les routes techniques
     */
    "/((?!api|trpc|socket.io|_next/static|_next/image|favicon.ico|logo|bg|typo|monitoring).*)",
  ],
};
