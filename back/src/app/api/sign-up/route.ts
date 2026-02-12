import { NextRequest } from "next/server";
import { SignUpService } from "@/lib/auth/services/signup";
import { PrismaAppUserRepository } from "@/lib/users/repositories";
import { prisma } from "@/lib/common";

export const dynamic = "force-dynamic";

import { parseJsonBodySafe, handleServiceResult, handleRouteError } from "@/lib/api-helpers";

const appUserRepository = new PrismaAppUserRepository(prisma);
const service = new SignUpService(appUserRepository);

export async function POST(req: NextRequest) {
  try {
    const body = await parseJsonBodySafe(req);
    const result = await service.execute(body, req.headers);
    return handleServiceResult(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
