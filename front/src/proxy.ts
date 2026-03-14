import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes qui ne nécessitent PAS d'être connecté
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
  "/monitoring" // Sentry tunnel
];

/**
 * Middleware proxy pour Next.js 16 (remplace middleware.ts)
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 0. Ignorer IMMÉDIATEMENT les assets statiques et les routes internes
  // On vérifie le matcher Next.js mais on double la sécurité ici
  if (
    pathname.startsWith("/_next") || 
    pathname.startsWith("/api") || 
    pathname.startsWith("/trpc") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/logo") ||
    pathname.startsWith("/bg") ||
    pathname.startsWith("/typo") ||
    pathname.startsWith("/public") ||
    pathname.includes(".") // Catch-all pour les fichiers avec extensions
  ) {
    return NextResponse.next();
  }

  // Détection large du cookie de session
  const allCookies = request.cookies.getAll();
  const sessionCookie = allCookies.find(c => c.name.includes("session_token"));
  const hasSession = !!sessionCookie;

  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + "/")
  );

  // 1. Si connecté et sur une page d'auth -> vers dashboard
  if (hasSession && (pathname === "/login" || pathname === "/sign-up")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 2. Si PAS connecté et page NON publique -> vers login
  if (!hasSession && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Export par défaut également au cas où
export default proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - trpc (tRPC routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets (logo, bg, typo)
     */
    "/((?!api|trpc|_next/static|_next/image|favicon.ico|logo|bg|typo|monitoring).*)",
  ],
};
