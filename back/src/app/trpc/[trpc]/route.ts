import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/routers";
import { createContext } from "@/lib/context";
import { NextRequest, NextResponse } from "next/server";
import { metricsMiddleware } from "@/lib/metrics/middleware";

const handler = metricsMiddleware(async (req: NextRequest) => {
	try {
		const response = await fetchRequestHandler({
			endpoint: "/trpc",
			req,
			router: appRouter,
			createContext: () => createContext(req),
			onError: ({ path, error }) => {
				console.error(`❌ tRPC Error on path "${path}":`, error);
			},
		});
		return response;
	} catch (error) {
		console.error("🔥 tRPC Handler Crash:", error);
		return new NextResponse(
			JSON.stringify({
				error: {
					message: "Internal Server Error",
					code: "INTERNAL_SERVER_ERROR",
				},
			}),
			{
				status: 500,
				headers: {
					"Content-Type": "application/json",
					"Access-Control-Allow-Credentials": "true",
					"Access-Control-Allow-Origin": "http://localhost:3001",
				},
			}
		);
	}
});

export function OPTIONS() {
	return new NextResponse(null, {
		status: 200,
		headers: {
			"Access-Control-Allow-Credentials": "true",
			"Access-Control-Allow-Origin": "http://localhost:3001",
			"Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
		},
	});
}

export { handler as GET, handler as POST };
