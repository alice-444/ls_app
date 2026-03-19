import type { IVerificationRepository } from "./verification.repository.interface";
import type { PrismaClient } from '@/lib/prisma-server';

export class PrismaVerificationRepository implements IVerificationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async upsertEmailChange(
    userId: string,
    newEmail: string,
    token: string,
    expiresAt: Date
  ): Promise<void> {
    await (this.prisma as any).account.update({
      where: { accountId: userId },
      data: {
        emailChangeToken: token,
        emailChangeNewEmail: newEmail,
        emailChangeTimestamp: expiresAt,
        updatedAt: new Date(),
      },
    });
  }

  async findEmailChangeToken(token: string) {
    const account = await (this.prisma as any).account.findFirst({
      where: {
        emailChangeToken: token,
        emailChangeTimestamp: {
          gt: new Date(),
        },
      },
      select: {
        userId: true,
        emailChangeNewEmail: true,
        emailChangeTimestamp: true,
      },
    });

    if (!account) return null;

    return {
      id: account.userId,
      identifier: `email-change:${account.userId}:${account.emailChangeNewEmail?.toLowerCase()}`,
      expiresAt: account.emailChangeTimestamp,
    };
  }

  async deleteById(userId: string): Promise<void> {
    await (this.prisma as any).account.update({
      where: { accountId: userId },
      data: {
        emailChangeToken: null,
        emailChangeNewEmail: null,
        emailChangeTimestamp: null,
        passwordResetToken: null,
        passwordResetTimestamp: null,
      },
    });
  }

  async upsertPasswordReset(
    userId: string,
    token: string,
    expiresAt: Date
  ): Promise<void> {
    await (this.prisma as any).account.update({
      where: { accountId: userId },
      data: {
        passwordResetToken: token,
        passwordResetTimestamp: expiresAt,
        updatedAt: new Date(),
      },
    });
  }

  async findPasswordResetToken(token: string) {
    const account = await (this.prisma as any).account.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetTimestamp: {
          gt: new Date(),
        },
      },
      select: {
        userId: true,
        passwordResetTimestamp: true,
      },
    });

    if (!account) return null;

    return {
      id: account.userId,
      identifier: `password-reset:${account.userId}`,
      expiresAt: account.passwordResetTimestamp,
    };
  }
}
