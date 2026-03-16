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

const API_BASE_URL = process.env.RUNTIME_API_URL || "https://api.learnsup.fr";

async function checkSession(request: NextRequest): Promise<boolean> {
  try {
    // Récupérer les cookies depuis la requête
    const cookieHeader = request.headers.get("cookie") || "";

    // Appeler le backend pour vérifier la session
    const response = await fetch(`${API_BASE_URL}/api/auth/session`, {
      method: "GET",
      headers: {
        cookie: cookieHeader,
      },
      credentials: "include",
    });

    const data = await response.json();
    return data.authenticated === true;
  } catch (error) {
    console.error("[middleware] Session check failed:", error);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignorer les routes techniques et Socket.IO
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/trpc") ||
    pathname.startsWith("/socket.io") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));

  // Si c'est une route publique, laisser passer
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Pour les routes protégées, vérifier la session
  const isAuthenticated = await checkSession(request);

  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

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
