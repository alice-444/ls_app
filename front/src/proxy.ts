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
  "/monitoring"
];

/**
 * Middleware proxy pour Next.js 16
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 0. Ignorer IMMÉDIATEMENT les assets et routes techniques
  if (
    pathname.startsWith("/_next") || 
    pathname.startsWith("/api") || 
    pathname.startsWith("/trpc") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/logo") ||
    pathname.startsWith("/bg") ||
    pathname.startsWith("/typo") ||
    pathname.startsWith("/public") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Détection du cookie de session (Better Auth)
  const allCookies = request.cookies.getAll();
  
  // On cherche n'importe quel cookie qui ressemble à une session
  // Better Auth utilise souvent 'better-auth.session_token' ou '__Secure-better-auth.session_token'
  const hasSession = allCookies.some(c => 
    c.name.includes("session_token") || 
    c.name.includes("auth_session")
  );

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
    // On garde l'URL d'origine pour y revenir après connexion
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    /*
     * On intercepte tout SAUF les routes techniques et les assets
     */
    "/((?!api|trpc|_next/static|_next/image|favicon.ico|logo|bg|typo|monitoring).*)",
  ],
};
