import type { ISessionRepository } from "./session.repository.interface";
import type { PrismaClient } from "../../../../../prisma/generated/client/client";

export class PrismaSessionRepository implements ISessionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findManyByUserId(userId: string) {
    const sessions = await (this.prisma as any).session.findMany({
      where: { userId },
      select: { token: true },
    });

    return sessions;
  }

  async deleteAllByUserId(userId: string): Promise<number> {
    const result = await (this.prisma as any).session.deleteMany({
      where: { userId },
    });

    return result.count;
  }

  async deleteAllExceptToken(
    userId: string,
    keepToken: string
  ): Promise<number> {
    const result = await (this.prisma as any).session.deleteMany({
      where: {
        userId,
        token: {
          not: keepToken,
        },
      },
    });

    return result.count;
  }
}

