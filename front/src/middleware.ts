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
  "/monitoring"
];

export function middleware(request: NextRequest) {
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

  const allCookies = request.cookies.getAll();
  const hasSession = allCookies.some(c => 
    c.name.includes("session_token") || 
    c.name.includes("auth_session")
  );

  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + "/")
  );

  if (hasSession && (pathname === "/login" || pathname === "/sign-up")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

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
     * Intercepte tout sauf les assets et les routes techniques
     */
    "/((?!api|trpc|socket.io|_next/static|_next/image|favicon.ico|logo|bg|typo|monitoring).*)",
  ],
};
