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
      where: { userId },
      orderBy: { createdAt: options?.orderBy || "desc" },
      take: options?.limit,
      skip: options?.offset,
    });

    return transactions.map((t) => ({
      id: t.id,
      userId: t.userId,
      amount: t.amount,
      type: t.type,
      description: t.description,
      createdAt: t.createdAt,
    }));
  }

  async countByUserId(userId: string): Promise<number> {
    return this.prisma.credit_transaction.count({
      where: { userId },
    });
  }
}
