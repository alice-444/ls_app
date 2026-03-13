import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth";

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

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Utilise better-auth pour vérifier la session via les cookies
  const sessionCookie = getSessionCookie(request);
  const hasSession = !!sessionCookie;

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

  // Note : La vérification fine des rôles (ADMIN vs USER) se fera toujours dans le RoleGate
  // car le middleware n'a pas un accès facile aux données de la base de données Prisma 
  // sans faire une requête API supplémentaire (ce qui ralentirait chaque page).
  
  return NextResponse.next();
}

// Configurer sur quelles routes le middleware doit s'exécuter
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public|bg|logo|typo).*)",
  ],
};
