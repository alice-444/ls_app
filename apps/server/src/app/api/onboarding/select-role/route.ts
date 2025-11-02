import { NextRequest, NextResponse } from "next/server";
import { OnboardingService } from "@/lib/auth/services/onboarding";
import { auth } from "@/lib/auth";
import { PrismaAppUserRepository } from "@/lib/users/repositories";
import { prisma } from "@/lib/common";

const appUserRepository = new PrismaAppUserRepository(prisma);
const service = new OnboardingService(appUserRepository);

export async function POST(req: NextRequest) {
	try {
		// Retrieve the user's session
		const session = await auth.api.getSession({
			headers: req.headers,
		});

		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await req.json().catch(() => ({}));
		const result = await service.selectRole(session.user.id, body);

		if (!result.ok) {
			return NextResponse.json({ error: result.error }, { status: result.status ?? 400 });
		}

		return NextResponse.json(result.data);
	} catch (error) {
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Internal server error" },
			{ status: 500 }
		);
	}
}

