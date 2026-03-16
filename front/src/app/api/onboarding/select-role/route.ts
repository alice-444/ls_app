import { NextRequest } from "next/server";
import { OnboardingService } from "@/lib/auth/services/onboarding";
import { PrismaAppUserRepository } from "@/lib/users/repositories";
import { prisma } from "@/lib/common";
import { onboardingRateLimit } from "@/lib/rate-limit";
import {
  getAuthenticatedSession,
  applyRateLimit,
  parseJsonBody,
  handleServiceResult,
  handleRouteError,
} from "@/lib/api-helpers";

const appUserRepository = new PrismaAppUserRepository(prisma);
const service = new OnboardingService(appUserRepository);

export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedSession(req);
    if (!authResult.ok) {
      return authResult.response;
    }
    const { userId } = authResult;

    const rateLimitResult = await applyRateLimit(onboardingRateLimit, userId);
    if (!rateLimitResult.ok) {
      return rateLimitResult.response;
    }

    const bodyResult = await parseJsonBody(req);
    if (!bodyResult.ok) {
      return bodyResult.response;
    }

    const result = await service.selectRole(userId, bodyResult.body);
    return handleServiceResult(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
