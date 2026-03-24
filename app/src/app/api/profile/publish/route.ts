import { NextRequest } from "next/server";
import { MentorProfileService } from "@/lib/auth/services/mentor-profile.service";
import { PrismaAppUserRepository } from "@/lib/users/repositories";
import { prisma } from "@/lib/common";
import { profileRateLimit } from "@/lib/rate-limit-server";
import {
  getAuthenticatedSession,
  applyRateLimit,
  handleServiceResult,
  handleRouteError,
} from "@/lib/api-helpers";

const appUserRepository = new PrismaAppUserRepository(prisma);
const service = new MentorProfileService(appUserRepository);

export async function POST(req: NextRequest) {
  try {
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
