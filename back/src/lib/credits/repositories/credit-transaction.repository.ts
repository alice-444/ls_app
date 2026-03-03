import type {
  ICreditTransactionRepository,
  CreditTransaction,
} from "./credit-transaction.repository.interface";
import type { PrismaClient } from "../../../../prisma/generated/client/client";
import type { CreditTransactionType } from "../../../../prisma/generated/client/enums";

export class PrismaCreditTransactionRepository
  implements ICreditTransactionRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  async findManyByUserId(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      orderBy?: "asc" | "desc";
    }
  ): Promise<CreditTransaction[]> {
    const transactions = await this.prisma.credit_transaction.findMany({
      where: { appUserId: userId },
      orderBy: { createdAt: options?.orderBy || "desc" },
      take: options?.limit,
      skip: options?.offset,
    });

    return transactions.map((t) => ({
      id: t.id,
      userId: t.appUserId,
      amount: t.amount,
      type: t.type,
      description: t.description,
      createdAt: t.createdAt,
    }));
  }

  async findFirstByUserIdAndType(
    userId: string,
    type: CreditTransactionType,
    options?: {
      descriptionContains?: string;
      orderBy?: "asc" | "desc";
    }
  ): Promise<CreditTransaction | null> {
    const where: any = {
      appUserId: userId,
      type,
    };

    if (options?.descriptionContains) {
      where.description = {
        contains: options.descriptionContains,
      };
    }

    const transaction = await this.prisma.credit_transaction.findFirst({
      where,
      orderBy: { createdAt: options?.orderBy || "desc" },
    });

    if (!transaction) return null;

    return {
      id: transaction.id,
      userId: transaction.appUserId,
      amount: transaction.amount,
      type: transaction.type,
      description: transaction.description,
      createdAt: transaction.createdAt,
    };
  }

  async countByUserId(userId: string): Promise<number> {
    return this.prisma.credit_transaction.count({
      where: { appUserId: userId },
    });
  }
}
