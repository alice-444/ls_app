import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaAppUserRepository } from "@/lib/users/repositories";
import { prisma } from "@/lib/common";

const appUserRepository = new PrismaAppUserRepository(prisma);

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const appUser = await appUserRepository.findByUserId(session.user.id);

    if (!appUser) {
      return NextResponse.json({ role: null });
    }

    return NextResponse.json({ role: appUser.role });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

