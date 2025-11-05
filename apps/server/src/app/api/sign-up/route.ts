import { NextRequest, NextResponse } from "next/server";
import { SignUpService } from "@/lib/auth/services/signup";
import { PrismaAppUserRepository } from "@/lib/users/repositories";
import { prisma } from "@/lib/common";

const appUserRepository = new PrismaAppUserRepository(prisma);
const service = new SignUpService(appUserRepository);

export async function POST(req: NextRequest) {
	const body = await req.json().catch(() => ({}));
	const result = await service.execute(body, req.headers);
	if (!result.ok) {
		return NextResponse.json({ error: result.error }, { status: result.status ?? 400 });
	}
	return NextResponse.json({ userId: result.data.userId });
}
