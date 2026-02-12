import { NextRequest } from "next/server";
import { profileRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
import { getAuthenticatedSession, applyRateLimit, handleServiceResult, handleRouteError } from "@/lib/api-helpers";

async function initializeServices() {
  if (!process.env.DATABASE_URL && !process.env.PRISMA_ACCELERATE_URL) {
    throw new Error("Database configuration missing");
  }
  const { ProfProfileService } = await import("@/lib/auth/services/prof-profile.service");
  const { PrismaAppUserRepository } = await import("@/lib/users/repositories");
  const { prisma } = await import("@/lib/common");

  const appUserRepository = new PrismaAppUserRepository(prisma);
  const service = new ProfProfileService(appUserRepository);
  return { service, appUserRepository };
}

export async function POST(req: NextRequest) {
  try {
    const { service } = await initializeServices();
    
    const authResult = await getAuthenticatedSession(req);
    if (!authResult.ok) {
      return authResult.response;
    }
    const { userId } = authResult;

    const rateLimitResult = await applyRateLimit(profileRateLimit, userId);
    if (!rateLimitResult.ok) {
      return rateLimitResult.response;
    }

    const result = await service.publishProfile(userId);
    return handleServiceResult(result);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { service } = await initializeServices();
    
    const authResult = await getAuthenticatedSession(req);
    if (!authResult.ok) {
      return authResult.response;
    }
    const { userId } = authResult;

    const rateLimitResult = await applyRateLimit(profileRateLimit, userId);
    if (!rateLimitResult.ok) {
      return rateLimitResult.response;
    }

    const result = await service.unpublishProfile(userId);
    return handleServiceResult(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
}
