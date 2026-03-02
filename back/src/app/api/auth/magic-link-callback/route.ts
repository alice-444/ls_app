import { NextRequest, NextResponse } from "next/server";
import { container } from "@/lib/di/container";
import { prisma } from "@/lib/common";
import { auth } from "better-auth";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=invalid_token", req.url));
  }

  try {
    const magicLink = await (prisma as any).magic_link_token.findUnique({
      where: { token },
    });

    if (!magicLink || magicLink.expiresAt < new Date()) {
      if (magicLink) {
        await (prisma as any).magic_link_token.delete({ where: { id: magicLink.id } });
      }
      return NextResponse.redirect(new URL("/login?error=expired_token", req.url));
    }

    const session = await auth.createSession(magicLink.userId);

    await (prisma as any).magic_link_token.delete({ where: { id: magicLink.id } });

    const response = NextResponse.redirect(new URL("/dashboard", req.url));
    response.cookies.set(session.name, session.value, session.attributes);

    return response;
  } catch (error) {
    return NextResponse.redirect(new URL("/login?error=server_error", req.url));
  }
}
