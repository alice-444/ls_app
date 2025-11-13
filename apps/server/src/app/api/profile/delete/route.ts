import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { buildDeletionPlan } from "@/lib/users/services/delete-account.usecase";
import prisma from "../../../../../prisma";
import { DeleteUserAccountService } from "@/lib/users/services/delete-account.service";
import {
  PrismaAccountRepository,
  PrismaAppUserRepository,
  PrismaAuthUserRepository,
  PrismaSessionRepository,
  NoopAuditLogRepository,
  NoopJobQueue,
} from "@/lib/users/services/repositories.prisma";
import { getAuthenticatedSession, handleRouteError } from "@/lib/api-helpers";

export async function DELETE(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedSession(req);
    if (!authResult.ok) {
      return authResult.response;
    }
    const { userId } = authResult;

    const appUsers = new PrismaAppUserRepository(prisma);
    const appUser = await appUsers.findByAuthUserId(userId);
    if (!appUser) {
      return NextResponse.json(
        { error: "App user not found" },
        { status: 404 }
      );
    }
    if (await appUsers.isAlreadyDeleted(appUser.id)) {
      return new NextResponse(null, { status: 204 });
    }

    const url = new URL(req.url);
    const reason = url.searchParams.get("reason") ?? undefined;

    const planResult = buildDeletionPlan({
      authUserId: userId,
      appUserId: appUser.id,
      policy: { retentionDays: 30, requireReason: false },
      now: new Date(),
      reason,
    });
    if (!planResult.ok) {
      const map = {
        NOT_AUTHENTICATED: 401,
        APPUSER_NOT_FOUND: 404,
        ALREADY_DELETED: 204,
        REASON_REQUIRED: 400,
      } as const;
      const status = map[planResult.error.type] ?? 400;
      return NextResponse.json({ error: planResult.error.type }, { status });
    }

    const repos = {
      appUsers,
      authUsers: new PrismaAuthUserRepository(prisma),
      sessions: new PrismaSessionRepository(prisma),
      accounts: new PrismaAccountRepository(prisma),
      audit: new NoopAuditLogRepository(prisma),
      jobs: new NoopJobQueue(prisma),
    };
    const service = new DeleteUserAccountService(prisma, repos);
    await service.execute(planResult.plan);

    try {
      await auth.api.signOut({ headers: req.headers });
    } catch {}

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleRouteError(error);
  }
}
