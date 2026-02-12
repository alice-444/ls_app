import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// Lazy load handlers to avoid initialization at build time
async function getHandlers() {
  const { auth } = await import("@/lib/auth");
  const { toNextJsHandler } = await import("better-auth/next-js");
  return toNextJsHandler(auth.handler);
}

export async function GET(req: NextRequest) {
  const { GET } = await getHandlers();
  return GET(req);
}

export async function POST(req: NextRequest) {
  const { POST } = await getHandlers();
  return POST(req);
}
