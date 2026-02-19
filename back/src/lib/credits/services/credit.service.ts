import type {
  ICreditService,
  CreditTransactionInput,
} from "./credit.service.interface";
import type { Result } from "../../common/types";
import { success, failure } from "../../common/types";
import { handleError, createErrorContext } from "../../common/error-handler";
import { generateInternalId } from "../../utils/id-generator";
import type { PrismaClient } from "../../../../prisma/generated/client/client";
import type { Prisma } from "../../../../prisma/generated/client/client";

/** Plafond par opération de crédit pour limiter les abus et erreurs. */
const MAX_CREDIT_AMOUNT_PER_OPERATION = 100_000;

export class CreditService implements ICreditService {
  constructor(private readonly prisma: PrismaClient) {}

  private async getAppUserId(
    userId: string,
    tx?: Omit<
      PrismaClient,
      "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
    >
  ): Promise<string> {
    const prisma = tx || this.prisma;
    const appUser = await prisma.app_user.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!appUser) {
      throw new Error(`App user not found for userId: ${userId}`);
    }
    return appUser.id;
  }

  private async createCreditTransaction(
    userId: string,
    amount: number,
    type: "TOP_UP" | "USAGE" | "REFUND",
    description: string,
    tx?: Omit<
      PrismaClient,
      "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
    >
  ): Promise<{ newBalance: number; transactionId: string }> {
    const prisma = tx || this.prisma;
    const appUserId = await this.getAppUserId(userId, tx);

    const isCredit = type === "TOP_UP" || type === "REFUND";
    const absoluteAmount = Math.abs(amount);

    const updatedUser = await prisma.app_user.update({
      where: { userId },
      data: {
        creditBalance: {
          [isCredit ? "increment" : "decrement"]: absoluteAmount,
        },
      },
      select: { creditBalance: true },
    });

    const transaction = await prisma.credit_transaction.create({
      data: {
        id: generateInternalId(),
        userId: appUserId,
        amount: isCredit ? absoluteAmount : -absoluteAmount,
        type,
        description,
      },
    });

    return {
      newBalance: updatedUser.creditBalance,
      transactionId: transaction.id,
    };
  }

  async checkBalance(
    userId: string,
    requiredAmount: number
  ): Promise<Result<{ balance: number; hasEnough: boolean }>> {
    try {
      const appUser = await this.prisma.app_user.findUnique({
        where: { userId },
        select: { creditBalance: true },
      });

      const balance = appUser?.creditBalance || 0;
      return success({
        balance,
        hasEnough: balance >= requiredAmount,
      });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("checkBalance", {
          userId,
          details: { requiredAmount },
        })
      );
    }
  }

  async debitCredits(
    userId: string,
    amount: number,
    description: string
  ): Promise<Result<{ newBalance: number; transactionId: string }>> {
    try {
      if (amount <= 0) {
        return failure("Le montant à débiter doit être positif", 400);
      }

      const result = await this.prisma.$transaction(async (tx) => {
        const appUser = await tx.app_user.findUnique({
          where: { userId },
          select: { creditBalance: true, id: true },
        });

        if (!appUser) {
          throw new Error(`App user not found for userId: ${userId}`);
        }

        const currentBalance = appUser.creditBalance || 0;
        if (currentBalance < amount) {
          throw new Error(
            `Crédits insuffisants. Vous avez ${currentBalance} crédit${
              currentBalance > 1 ? "s" : ""
            } mais ${amount} crédits sont requis. Veuillez acheter plus de crédits.`
          );
        }

        return this.createCreditTransaction(
          userId,
          amount,
          "USAGE",
          description,
          tx
        );
      });

      return success(result);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Crédits insuffisants")
      ) {
        return failure(error.message, 400);
      }
      return handleError(
        error,
        createErrorContext("debitCredits", {
          userId,
          details: { amount, description },
        })
      );
    }
  }

  async debitCreditsInTransaction(
    userId: string,
    amount: number,
    description: string,
    tx: Omit<
      PrismaClient,
      "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
    >
  ): Promise<Result<{ newBalance: number; transactionId: string }>> {
    try {
      if (amount <= 0) {
        return failure("Le montant à débiter doit être positif", 400);
      }

      const appUser = await tx.app_user.findUnique({
        where: { userId },
        select: { creditBalance: true, id: true },
      });

      if (!appUser) {
        return failure(`App user not found for userId: ${userId}`, 404);
      }

      const currentBalance = appUser.creditBalance || 0;
      if (currentBalance < amount) {
        return failure(
          `Crédits insuffisants. Vous avez ${currentBalance} crédit${
            currentBalance > 1 ? "s" : ""
          } mais ${amount} crédits sont requis. Veuillez acheter plus de crédits.`,
          400
        );
      }

      const result = await this.createCreditTransaction(
        userId,
        amount,
        "USAGE",
        description,
        tx
      );

      return success(result);
    } catch (error) {
      return handleError(
        error,
        createErrorContext("debitCreditsInTransaction", {
          userId,
          details: { amount, description },
        })
      );
    }
  }

  async creditCredits(
    userId: string,
    amount: number,
    description: string
  ): Promise<Result<{ newBalance: number; transactionId: string }>> {
    try {
      if (amount <= 0) {
        return failure("Le montant à créditer doit être positif", 400);
      }
      if (amount > MAX_CREDIT_AMOUNT_PER_OPERATION) {
        return failure(
          `Le montant à créditer ne peut pas dépasser ${MAX_CREDIT_AMOUNT_PER_OPERATION} par opération`,
          400
        );
      }

      const result = await this.prisma.$transaction(async (tx) => {
        return this.createCreditTransaction(
          userId,
          amount,
          "TOP_UP",
          description,
          tx
        );
      });

      return success(result);
    } catch (error) {
      return handleError(
        error,
        createErrorContext("creditCredits", {
          userId,
          details: { amount, description },
        })
      );
    }
  }

  async getBalance(userId: string): Promise<Result<{ balance: number }>> {
    try {
      const appUser = await this.prisma.app_user.findUnique({
        where: { userId },
        select: { creditBalance: true },
      });

      return success({
        balance: appUser?.creditBalance || 0,
      });
    } catch (error) {
      return handleError(error, createErrorContext("getBalance", { userId }));
    }
  }
}
