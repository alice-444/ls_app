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
  "/mentors"
];

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // 0. Skip all static assets and internal Next.js routes immediately
  if (
    pathname.startsWith("/_next") || 
    pathname.startsWith("/api") || 
    pathname.startsWith("/trpc") ||
    pathname.includes(".") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/logo") ||
    pathname.startsWith("/bg") ||
    pathname.startsWith("/typo")
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

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (static assets)
     */
    "/((?!api|trpc|_next/static|_next/image|favicon.ico|logo|bg|typo|public).*)",
  ],
};
