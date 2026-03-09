import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/routers";
import { createContext } from "@/lib/context";
import { NextRequest, NextResponse } from "next/server";

function handler(req: NextRequest) {
	return fetchRequestHandler({
		endpoint: "/trpc",
		req,
		router: appRouter,
		createContext: () => createContext(req),
	});
}

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
