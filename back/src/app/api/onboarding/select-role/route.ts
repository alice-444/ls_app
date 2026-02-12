import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // Lazy-load ALL dependencies to prevent build-time execution
    const { getAuthenticatedSession, applyRateLimit, parseJsonBody, handleServiceResult, handleRouteError } =
      await import("@/lib/api-helpers");
    const { onboardingRateLimit } = await import("@/lib/rate-limit");
    const { PrismaAppUserRepository } = await import("@/lib/users/repositories");
    const { prisma } = await import("@/lib/common");
    const { OnboardingService } = await import("@/lib/auth/services/onboarding");

    if (!process.env.DATABASE_URL) {
      return new Response(JSON.stringify({ ok: true, message: "No database configured (build mode)" }), {
        status: 200,
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

    const appUserRepository = new PrismaAppUserRepository(prisma);
    const service = new OnboardingService(appUserRepository);

    const result = await service.selectRole(userId, bodyResult.body);
    return handleServiceResult(result);
  } catch (error) {
    // Lazy-load error handler
    const { handleRouteError } = await import("@/lib/api-helpers");
    return handleRouteError(error);
  }
}
