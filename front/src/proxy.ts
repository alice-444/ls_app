import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes qui nécessitent d'être connecté
const PROTECTED_ROUTES = [
  "/dashboard",
  "/my-workshops",
  "/workshop-editor",
  "/mentor-profile",
  "/workshop-room",
  "/profil",
  "/network",
  "/inbox",
  "/apprentice",
  "/buy-credits"
];

// Routes réservées aux admins
const ADMIN_ROUTES = ["/admin"];

// Routes réservées aux utilisateurs non connectés
const AUTH_ROUTES = ["/login", "/sign-up", "/forgot-password"];

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Détecte manuellement le cookie de session Better Auth
  // Fonctionne pour les cookies standard et sécurisés
  const sessionToken = request.cookies.get("better-auth.session_token") || 
                       request.cookies.get("__Secure-better-auth.session_token");
  const hasSession = !!sessionToken;

  // 1. Redirection si déjà connecté et tente d'aller sur login/sign-up
  if (hasSession && AUTH_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 2. Redirection si non connecté et tente d'aller sur une route protégée
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route));

  if (!hasSession && (isProtectedRoute || isAdminRoute)) {
    const loginUrl = new URL("/login", request.url);
    // On garde la page actuelle en paramètre pour y revenir après login
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Configurer sur quelles routes le proxy doit s'exécuter
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - trpc (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!api|trpc|_next/static|_next/image|favicon.ico|public|bg|logo|typo).*)",
  ],
};
