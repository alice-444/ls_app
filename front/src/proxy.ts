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
    "/((?!api|trpc|_next/static|_next/image|favicon.ico|public|bg|logo|typo).*)",
  ],
};
