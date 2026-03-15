import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // EXCLUSION CRITIQUE : Ne pas interférer avec Socket.IO
  // Socket.IO gère ses propres en-têtes et le handshake.
  if (pathname.startsWith("/socket.io")) {
    return NextResponse.next();
  }

  // Use the actual request origin or fallback to process.env.CORS_ORIGIN
  const origin =
    request.headers.get("origin") || process.env.CORS_ORIGIN || "*";

  // Handle preflight OPTIONS requests
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS,PUT,PATCH",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version, Sentry-Trace, baggage",
      },
    });
  }

  const response = NextResponse.next();

  // Add CORS headers to all responses
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET,POST,DELETE,OPTIONS,PUT,PATCH",
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version, Sentry-Trace, baggage",
  );

  return response;
}

export const config = {
  // On matche tout sauf /socket.io pour éviter les conflits
  matcher: [
    "/((?!socket.io).*)",
  ],
};
