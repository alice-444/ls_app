import { NextRequest, NextResponse } from "next/server";
import { profileRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
import {
  getAuthenticatedSession,
  applyRateLimit,
  parseJsonBody,
  handleServiceResult,
  handleRouteError,
} from "@/lib/api-helpers";

async function initializeServices() {
  if (!process.env.DATABASE_URL && !process.env.PRISMA_ACCELERATE_URL) {
    throw new Error("Database configuration missing");
  }
  const { ProfProfileService } = await import("@/lib/auth/services/prof-profile.service");
  const { PrismaAppUserRepository } = await import("@/lib/users/repositories");
  const { prisma } = await import("@/lib/common");

  const appUserRepository = new PrismaAppUserRepository(prisma);
  const service = new ProfProfileService(appUserRepository);
  return { service, prisma };
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

    const bodyResult = await parseJsonBody(req);
    if (!bodyResult.ok) {
      return bodyResult.response;
    }

    const result = await service.saveProfile(userId, bodyResult.body);
    return handleServiceResult(result);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { prisma } = await initializeServices();

    const authResult = await getAuthenticatedSession(req);
    if (!authResult.ok) {
      return authResult.response;
    }
    const { userId } = authResult;

    const fullAppUser = await (prisma as any).app_user.findUnique({
      where: { userId },
      select: {
        isPublished: true,
        publishedAt: true,
        bio: true,
        domain: true,
        photoUrl: true,
        qualifications: true,
        experience: true,
        socialMediaLinks: true,
        areasOfExpertise: true,
        mentorshipTopics: true,
        calendlyLink: true,
      },
    });

    if (!fullAppUser) {
      return NextResponse.json({ isPublished: false });
    }

    const user = await (prisma as any).user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
      },
    });

    return NextResponse.json({
      isPublished: fullAppUser.isPublished || false,
      publishedAt: fullAppUser.publishedAt || null,
      profile: {
        name: user?.name || null,
        bio: fullAppUser.bio || null,
        domain: fullAppUser.domain || null,
        photoUrl: fullAppUser.photoUrl || null,
        qualifications: fullAppUser.qualifications || null,
        experience: fullAppUser.experience || null,
        socialMediaLinks: fullAppUser.socialMediaLinks || null,
        areasOfExpertise: fullAppUser.areasOfExpertise || null,
        mentorshipTopics: fullAppUser.mentorshipTopics || null,
        calendlyLink: fullAppUser.calendlyLink || null,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
