import { NextRequest, NextResponse } from "next/server";
import { PrismaAppUserRepository } from "@/lib/users/repositories";
import { prisma } from "@/lib/common";
import { getAuthenticatedSession, handleRouteError } from "@/lib/api-helpers";

const appUserRepository = new PrismaAppUserRepository(prisma);

export async function GET(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedSession(req);
    if (!authResult.ok) {
      return authResult.response;
    }
    const { userId } = authResult;

    const appUser = await appUserRepository.findByUserId(userId);

    if (!appUser) {
      return NextResponse.json({ role: null, status: null });
    }

    return NextResponse.json({ 
      role: appUser.role,
      status: appUser.status 
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
