import type { Result } from "../../common/types";

export interface CreditTransactionInput {
  userId: string;
  amount: number;
  type: "TOP_UP" | "USAGE" | "REFUND";
  description: string;
}

export interface ICreditService {
  checkBalance(
    userId: string,
    requiredAmount: number
  ): Promise<Result<{ balance: number; hasEnough: boolean }>>;

  debitCredits(
    userId: string,
    amount: number,
    description: string
  ): Promise<Result<{ newBalance: number; transactionId: string }>>;

  debitCreditsInTransaction(
    userId: string,
    amount: number,
    description: string,
    tx: Omit<
      any,
      "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
    >
  ): Promise<Result<{ newBalance: number; transactionId: string }>>;

  refundCreditsInTransaction(
    userId: string,
    amount: number,
    description: string,
    tx: Omit<
      any,
      "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
    >
  ): Promise<Result<{ newBalance: number; transactionId: string }>>;

  creditCredits(
    userId: string,
    amount: number,
    description: string
  ): Promise<Result<{ newBalance: number; transactionId: string }>>;

  refundCredits(
    userId: string,
    amount: number,
    description: string
  ): Promise<Result<{ newBalance: number; transactionId: string }>>;

  getBalance(userId: string): Promise<Result<{ balance: number }>>;

  getHistory(
    userId: string,
    params?: { limit?: number; offset?: number }
  ): Promise<
    Result<{
      transactions: Array<{
        id: string;
        amount: number;
        type: "TOP_UP" | "USAGE" | "REFUND";
        description: string;
        createdAt: Date;
      }>;
      total: number;
    }>
  >;
}
