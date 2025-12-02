import type { NextRequest } from "next/server";
import { auth } from "./auth";

export async function createContext(req: NextRequest) {
	const session = await auth.api.getSession({
		headers: req.headers,
	});
	
	const forwardedFor = req.headers.get("x-forwarded-for");
	const ipAddress =
		forwardedFor?.split(",")[0]?.trim() ||
		req.headers.get("x-real-ip") ||
		"unknown";

	return {
		session,
		ipAddress,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
