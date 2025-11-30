import type { CreditTransactionType as PrismaCreditTransactionType } from "../../../../prisma/generated/client/enums";

export type CreditTransactionType = PrismaCreditTransactionType;

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  type: CreditTransactionType;
  description: string;
  createdAt: Date;
}

export interface ICreditTransactionRepository {
  findManyByUserId(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      orderBy?: "asc" | "desc";
    }
  ): Promise<CreditTransaction[]>;

  findFirstByUserIdAndType(
    userId: string,
    type: CreditTransactionType,
    options?: {
      descriptionContains?: string;
      orderBy?: "asc" | "desc";
    }
  ): Promise<CreditTransaction | null>;

  countByUserId(userId: string): Promise<number>;
}
