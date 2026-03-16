import type { PrismaClient } from '@/lib/prisma-server';
import {
  AppUserRepository,
  AuthUserRepository,
  SessionRepository,
  AccountRepository,
  AuditLogRepository,
  JobQueue,
} from "./delete-account.types";
import { generateInternalId } from "../../../../utils/id-generator";

export class PrismaAppUserRepository implements AppUserRepository {
  constructor(private readonly prisma: any) {}

  async findByAuthUserId(
    userId: string
  ): Promise<{ id: string; deletedAt: Date | null } | null> {
    const row = await this.prisma.user.findUnique({
      where: { userId },
      select: { id: true, deletedAt: true },
    });
    if (!row) return null;
    return { id: row.id as string, deletedAt: (row as any).deletedAt ?? null };
  }

  async softDelete(
    userId: string,
    when: Date,
    reason?: string
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: when,
        deletionRequestedAt: when,
        deletionReason: reason,
      } as any,
    });
  }

  async isAlreadyDeleted(userId: string): Promise<boolean> {
    const row = await this.prisma.user.findUnique({
      where: { id: userId },
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
    const res = await (this.prisma as any).session.deleteMany({ where: { userId } });
    return res.count;
  }
}

export class PrismaAccountRepository implements AccountRepository {
  constructor(private readonly prisma: any) {}

  async unlinkAllByUserId(userId: string): Promise<number> {
    const res = await (this.prisma as any).account.deleteMany({ where: { userId } });
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
    // Note: audit_log model in schema uses adminId and targetId. 
    // This repository seems to want to record user-initiated actions.
    // For now, let's keep it minimal or use a different mechanism if needed.
    // Given the current schema, we skip this or map it appropriately.
  }
}

export class NoopJobQueue implements JobQueue {
  constructor(private readonly prisma: any) {}
  async enqueueHardPurge(userId: string, runAt: Date): Promise<void> {
    await this.prisma.deletion_job.create({
      data: { 
        userId, 
        runAt,
        status: "PENDING"
      },
    });
  }
}
