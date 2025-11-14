import type { PrismaClient } from "../../../../prisma/generated/client/client";
import {
  AppUserRepository,
  AuthUserRepository,
  SessionRepository,
  AccountRepository,
  AuditLogRepository,
  JobQueue,
} from "./delete-account.types";
import { generateInternalId } from "../../utils/id-generator";

export class PrismaAppUserRepository implements AppUserRepository {
  constructor(private readonly prisma: any) {}

  async findByAuthUserId(
    userId: string
  ): Promise<{ id: string; deletedAt: Date | null } | null> {
    const row = await (this.prisma as any).appUser.findUnique({
      where: { userId },
      select: { id: true, deletedAt: true },
    });
    if (!row) return null;
    return { id: row.id as string, deletedAt: (row as any).deletedAt ?? null };
  }

  async softDelete(
    appUserId: string,
    when: Date,
    reason?: string
  ): Promise<void> {
    await this.prisma.appUser.update({
      where: { id: appUserId },
      data: {
        deletedAt: when,
        deletionRequestedAt: when,
        deletionReason: reason,
      } as any,
    });
  }

  async isAlreadyDeleted(appUserId: string): Promise<boolean> {
    const row = await (this.prisma as any).appUser.findUnique({
      where: { id: appUserId },
      select: { deletedAt: true },
    });
    return !!(row as any)?.deletedAt;
  }
}

export class PrismaAuthUserRepository implements AuthUserRepository {
  constructor(private readonly prisma: any) {}

  async disable(userId: string, when: Date): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { isDisabled: true, updatedAt: when } as any,
    });
  }
}

export class PrismaSessionRepository implements SessionRepository {
  constructor(private readonly prisma: any) {}

  async deleteAllByUserId(userId: string): Promise<number> {
    const res = await this.prisma.session.deleteMany({ where: { userId } });
    return res.count;
  }
}

export class PrismaAccountRepository implements AccountRepository {
  constructor(private readonly prisma: any) {}

  async unlinkAllByUserId(userId: string): Promise<number> {
    const res = await this.prisma.account.deleteMany({ where: { userId } });
    return res.count;
  }
}

export class NoopAuditLogRepository implements AuditLogRepository {
  constructor(private readonly prisma: any) {}
  async record(
    userId: string,
    type: string,
    meta?: Record<string, unknown>
  ): Promise<void> {
    await (this.prisma as any).auditLog.create({
      data: { id: generateInternalId(), userId, type, meta: meta ?? null },
    });
  }
}

export class NoopJobQueue implements JobQueue {
  constructor(private readonly prisma: any) {}
  async enqueueHardPurge(userId: string, runAt: Date): Promise<void> {
    await (this.prisma as any).deletionJob.create({
      data: { id: generateInternalId(), userId, runAt },
    });
  }
}
