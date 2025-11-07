import { NextRequest, NextResponse } from "next/server";
import { ProfProfileService } from "@/lib/auth/services/prof-profile.service";
import { PrismaAppUserRepository } from "@/lib/users/repositories";
import { prisma } from "@/lib/common";
import { profileRateLimit } from "@/lib/rate-limit";
import {
  getAuthenticatedSession,
  applyRateLimit,
  parseJsonBody,
  handleServiceResult,
  handleRouteError,
} from "@/lib/api-helpers";

const appUserRepository = new PrismaAppUserRepository(prisma);
const service = new ProfProfileService(appUserRepository);

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
    const authResult = await getAuthenticatedSession(req);
    if (!authResult.ok) {
      return authResult.response;
    }
    const { userId } = authResult;

    const appUser = await appUserRepository.findByUserId(userId);

    if (!appUser) {
      return NextResponse.json({ isPublished: false });
    }

    const fullProfile = (await prisma.appUser.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })) as any;

    if (!fullProfile) {
      return NextResponse.json({ isPublished: false });
    }

    return NextResponse.json({
      isPublished: fullProfile?.isPublished || false,
      publishedAt: fullProfile?.publishedAt || null,
      profile: {
        name: fullProfile.user?.name || null,
        bio: fullProfile.bio || null,
        domain: fullProfile.domain || null,
        photoUrl: fullProfile.photoUrl || null,
        qualifications: fullProfile.qualifications || null,
        experience: fullProfile.experience || null,
        socialMediaLinks: fullProfile.socialMediaLinks || null,
        areasOfExpertise: fullProfile.areasOfExpertise || null,
        mentorshipTopics: fullProfile.mentorshipTopics || null,
        calendlyLink: fullProfile.calendlyLink || null,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
