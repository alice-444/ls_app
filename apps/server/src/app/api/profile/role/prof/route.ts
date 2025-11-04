import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ProfProfileService } from "@/lib/auth/services/prof-profile.service";
import { PrismaAppUserRepository } from "@/lib/users/repositories";
import { prisma } from "@/lib/common";
import { profileRateLimit } from "@/lib/rate-limit";

const appUserRepository = new PrismaAppUserRepository(prisma);
const service = new ProfProfileService(appUserRepository);

export async function POST(req: NextRequest) {
  try {
    // Retrieve the user's session
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting
    const identifier = session.user.id;
    const { success, limit, reset, remaining } = await profileRateLimit.limit(identifier);

    if (!success) {
      return NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
          limit,
          reset,
          remaining,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        }
      );
    }

    const body = await req.json().catch(() => ({}));
    const result = await service.saveProfile(session.user.id, body);

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status ?? 400 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

