import { NextRequest, NextResponse } from "next/server";
import { SignInService } from "@/lib/auth/services/signin";

const service = new SignInService();

export async function POST(req: NextRequest) {
	const body = await req.json().catch(() => ({}));
	const result = await service.execute(body, req.headers);
	if (!result.ok) {
		return NextResponse.json({ error: result.error }, { status: result.status ?? 400 });
	}
	return NextResponse.json({ userId: result.data.userId });
}
