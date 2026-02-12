import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

import { parseJsonBodySafe, handleServiceResult, handleRouteError } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.DATABASE_URL && !process.env.PRISMA_ACCELERATE_URL) {
      return handleServiceResult({ ok: false, error: "Database not configured", status: 503 });
    }

    // Lazy-load dependencies
    const { SignUpService } = await import("@/lib/auth/services/signup");
    const { PrismaAppUserRepository } = await import("@/lib/users/repositories");
    const { prisma } = await import("@/lib/common");

    const appUserRepository = new PrismaAppUserRepository(prisma);
    const service = new SignUpService(appUserRepository);

    const body = await parseJsonBodySafe(req);
    const result = await service.execute(body, req.headers);
    return handleServiceResult(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
