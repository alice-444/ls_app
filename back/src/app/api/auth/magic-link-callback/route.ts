import { NextRequest, NextResponse } from "next/server";

/**
 * Redirect legacy magic-link-callback URLs to Better Auth's magic-link/verify.
 * Kept for backward compatibility with old emails.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=invalid_token", req.url));
  }

  const baseUrl = process.env.BETTER_AUTH_URL || new URL(req.url).origin;
  const frontendUrl = process.env.CORS_ORIGIN || "https://app.learnsup.fr";
  
  const verifyUrl = new URL("/api/auth/magic-link/verify", baseUrl);
  verifyUrl.searchParams.set("token", token);
  verifyUrl.searchParams.set("callbackURL", `${frontendUrl}/dashboard`);
  verifyUrl.searchParams.set("errorCallbackURL", `${frontendUrl}/login?error=magic_link`);

  return NextResponse.redirect(verifyUrl);
}
