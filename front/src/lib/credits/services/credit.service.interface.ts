import type { Result } from "../../common/types";

export interface CreditBalanceResult {
  balance: number;
}

export interface CreditOperationResult {
  userId: string;
  newBalance: number;
  transactionId: string;
}

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
  ): Promise<Result<CreditBalanceResult & { hasEnough: boolean }>>;

  debitCredits(
    userId: string,
    amount: number,
    description: string
  ): Promise<Result<CreditOperationResult>>;

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
  ): Promise<Result<CreditOperationResult>>;

  refundCredits(
    userId: string,
    amount: number,
    description: string
  ): Promise<Result<CreditOperationResult>>;

  getBalance(userId: string): Promise<Result<CreditBalanceResult>>;

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
