import type { IVerificationRepository } from "./verification.repository.interface";
import type { PrismaClient } from "../../../../../prisma/generated/client/client";

export class PrismaVerificationRepository implements IVerificationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async upsertEmailChange(
    userId: string,
    newEmail: string,
    token: string,
    expiresAt: Date
  ): Promise<void> {
    const identifier = `email-change:${userId}:${newEmail.toLowerCase()}`;

    await (this.prisma as any).verification.upsert({
      where: {
        identifier_value: {
          identifier,
          value: token,
        },
      },
      create: {
        id: `email-change-${userId}-${Date.now()}`,
        identifier,
        value: token,
        expiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      update: {
        value: token,
        expiresAt,
        updatedAt: new Date(),
      },
    });
  }

  async findEmailChangeToken(token: string) {
    const verification = await (this.prisma as any).verification.findFirst({
      where: {
        value: token,
        identifier: {
          startsWith: "email-change:",
        },
        expiresAt: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        identifier: true,
        expiresAt: true,
      },
    });

    return verification;
  }

  async deleteById(id: string): Promise<void> {
    await (this.prisma as any).verification.delete({
      where: { id },
    });
  }

  async upsertPasswordReset(
    userId: string,
    token: string,
    expiresAt: Date
  ): Promise<void> {
    const identifier = `password-reset:${userId}`;

    await (this.prisma as any).verification.upsert({
      where: {
        identifier_value: {
          identifier,
          value: token,
        },
      },
      create: {
        id: `password-reset-${userId}-${Date.now()}`,
        identifier,
        value: token,
        expiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      update: {
        value: token,
        expiresAt,
        updatedAt: new Date(),
      },
    });
  }

  async findPasswordResetToken(token: string) {
    const verification = await (this.prisma as any).verification.findFirst({
      where: {
        value: token,
        identifier: {
          startsWith: "password-reset:",
        },
        expiresAt: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        identifier: true,
        expiresAt: true,
      },
    });

    return verification;
  }
}

