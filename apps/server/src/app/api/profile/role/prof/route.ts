import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ProfProfileService } from "@/lib/auth/services/prof-profile.service";
import { PrismaAppUserRepository } from "@/lib/users/repositories";
import { prisma } from "@/lib/common";
import { profileRateLimit } from "@/lib/rate-limit";

const appUserRepository = new PrismaAppUserRepository(prisma);
const service = new ProfProfileService(appUserRepository);

export async function POST(req: NextRequest) {
  let session: Awaited<ReturnType<typeof auth.api.getSession>> | null = null;
  
  try {
    // Retrieve the user's session
    session = await auth.api.getSession({
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

    let body: unknown;
    try {
      body = await req.json();
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const result = await service.saveProfile(session.user.id, body);

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status ?? 400 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    const errorMessage =
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : error instanceof Error
          ? error.message
          : "Internal server error";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

