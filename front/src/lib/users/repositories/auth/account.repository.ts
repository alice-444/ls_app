import type { IAccountRepository } from "./account.repository.interface";
import type { PrismaClient } from '@/lib/prisma';

export class PrismaAccountRepository implements IAccountRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findCredentialAccount(userId: string) {
    const account = await (this.prisma as any).account.findFirst({
      where: {
        userId,
        providerId: "credential",
      },
      select: { id: true, password: true },
    });

    return account;
  }

  async updatePassword(accountId: string, hashedPassword: string): Promise<void> {
    await (this.prisma as any).account.update({
      where: { id: accountId },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });
  }

  async setPasswordNull(userId: string): Promise<void> {
    await (this.prisma as any).account.updateMany({
      where: { userId },
      data: {
        password: null,
        updatedAt: new Date(),
      },
    });
  }
}

