import { NextRequest } from "next/server";
import { onboardingRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
import {
  getAuthenticatedSession,
  applyRateLimit,
  parseJsonBody,
  handleServiceResult,
  handleRouteError,
} from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return new Response(JSON.stringify({ error: "DATABASE_URL is not set" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      });
    }

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

    // Lazy-load dependencies
    const { PrismaAppUserRepository } = await import("@/lib/users/repositories");
    const { prisma } = await import("@/lib/common");
    const { OnboardingService } = await import("@/lib/auth/services/onboarding");

    const appUserRepository = new PrismaAppUserRepository(prisma);
    const service = new OnboardingService(appUserRepository);

    const result = await service.selectRole(userId, bodyResult.body);
    return handleServiceResult(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
