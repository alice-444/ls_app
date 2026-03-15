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

  const frontendUrl = process.env.CORS_ORIGIN || "https://app.learnsup.fr";
  const verifyUrl = new URL("/auth/verify", frontendUrl);
  verifyUrl.searchParams.set("token", token);

  return NextResponse.redirect(verifyUrl);
}
