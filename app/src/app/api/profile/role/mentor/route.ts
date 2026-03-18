import { NextRequest, NextResponse } from "next/server";
import { MentorProfileService } from "@/lib/auth/services/mentor-profile.service";
import { PrismaAppUserRepository } from "@/lib/users/repositories";
import { prisma } from "@/lib/common";
import { profileRateLimit } from "@/lib/rate-limit-server";
import {
  getAuthenticatedSession,
  applyRateLimit,
  parseJsonBody,
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

    const fullAppUser = await prisma.user.findUnique({
      where: { id: userId },
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
        displayName: true,
        iceBreakerTags: true,
      },
    });

    if (!fullAppUser) {
      return NextResponse.json({ isPublished: false });
    }

    const user = await prisma.user.findUnique({
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
        displayName: fullAppUser.displayName || null,
        iceBreakerTags: fullAppUser.iceBreakerTags || null,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
