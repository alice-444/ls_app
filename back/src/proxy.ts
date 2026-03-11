import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
	// Handle preflight OPTIONS requests
	if (request.method === "OPTIONS") {
		return new NextResponse(null, {
			status: 200,
			headers: {
				"Access-Control-Allow-Credentials": "true",
				"Access-Control-Allow-Origin":
					process.env.CORS_ORIGIN || "http://localhost:3001",
				"Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
				"Access-Control-Allow-Headers": "Content-Type, Authorization",
			},
		});
	}

	const res = NextResponse.next();

	res.headers.append("Access-Control-Allow-Credentials", "true");
	res.headers.append(
		"Access-Control-Allow-Origin",
		process.env.CORS_ORIGIN || "http://localhost:3001",
	);
	res.headers.append("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
	res.headers.append(
		"Access-Control-Allow-Headers",
		"Content-Type, Authorization",
	);

	return res;
}

export const config = {
	matcher: "/((?!api|trpc|_next/static|_next/image|favicon.ico|public|logo|bg|typo).*)",
};
