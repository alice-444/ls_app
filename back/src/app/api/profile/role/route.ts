import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSession, handleRouteError } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    if (!process.env.DATABASE_URL && !process.env.PRISMA_ACCELERATE_URL) {
      return NextResponse.json({ role: null }, { status: 200 });
    }

    // Lazy-load dependencies
    const { PrismaAppUserRepository } = await import("@/lib/users/repositories");
    const { prisma } = await import("@/lib/common");

    const appUserRepository = new PrismaAppUserRepository(prisma);

    const authResult = await getAuthenticatedSession(req);
    if (!authResult.ok) {
      return authResult.response;
    }
    const { userId } = authResult;

    const appUser = await appUserRepository.findByUserId(userId);

    if (!appUser) {
      return NextResponse.json({ role: null });
    }

    return NextResponse.json({ role: appUser.role });
  } catch (error) {
    return handleRouteError(error);
  }
}
