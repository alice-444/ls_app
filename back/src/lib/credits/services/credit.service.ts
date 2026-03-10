import type { PrismaClient } from '@/lib/prisma';
import { failure, success, Result } from "@/lib/common/types";
import {
  ICreditService,
  CreditBalanceResult,
  CreditOperationResult,
} from "./credit.service.interface";
import { generateInternalId } from "../../utils/id-generator";
import { creditsExchangedTotal } from "../../metrics/prometheus";
import { logger } from "../../common/logger";

export class CreditService implements ICreditService {
  constructor(private readonly prisma: PrismaClient) {}

  async getBalance(userId: string): Promise<Result<CreditBalanceResult>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { userId },
        select: { creditBalance: true },
      });

      return success({ balance: user?.creditBalance || 0 });
    } catch (error) {
      logger.error("Failed to get balance", error, { userId });
      return failure("Une erreur est survenue lors de la récupération du solde.", 500);
    }
  }

  async checkBalance(
    userId: string,
    requiredAmount: number
  ): Promise<Result<CreditBalanceResult & { hasEnough: boolean }>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { userId },
        select: { creditBalance: true },
      });

      const balance = user?.creditBalance || 0;
      return success({
        balance,
        hasEnough: balance >= requiredAmount,
      });
    } catch (error) {
      logger.error("Failed to check balance", error, { userId, requiredAmount });
      return failure("Une erreur est survenue lors de la vérification du solde.", 500);
    }
  }

  async debitCredits(
    userId: string,
    amount: number,
    description: string
  ): Promise<Result<CreditOperationResult>> {
    if (amount <= 0) return failure("Le montant doit être positif.", 400);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
          where: { userId },
          select: { id: true, creditBalance: true },
        });

        if (!user) return failure("Utilisateur non trouvé.", 404);
        if (user.creditBalance < amount) {
          return failure("Crédits insuffisants.", 400);
        }

        const updatedUser = await tx.user.update({
          where: { userId },
          data: { creditBalance: { decrement: amount } },
        });

        const transaction = await tx.credit_transaction.create({
          data: {
            id: generateInternalId(),
            userId: user.id,
            amount: -amount,
            description,
            type: "USAGE",
          },
        });

        creditsExchangedTotal.labels("usage").inc(amount);
        return success({
          userId,
          newBalance: updatedUser.creditBalance,
          transactionId: transaction.id,
        });
      });
    } catch (error: any) {
      if (error.ok === false) return error;
      logger.error("Failed to debit credits", error, { userId, amount });
      return failure(error.message || "Une erreur inattendue s'est produite lors de debitCredits. Veuillez réessayer.", 500);
    }
  }

  async debitCreditsInTransaction(
    userId: string,
    amount: number,
    description: string,
    tx: any
  ): Promise<Result<{ newBalance: number; transactionId: string }>> {
    if (amount <= 0) return failure("Le montant doit être positif.", 400);

    const user = await tx.user.findUnique({
      where: { userId },
      select: { id: true, creditBalance: true },
    });

    if (!user) return failure("Utilisateur non trouvé.", 404);
    if (user.creditBalance < amount) {
      return failure("Crédits insuffisants.", 400);
    }

    const updatedUser = await tx.user.update({
      where: { userId },
      data: { creditBalance: { decrement: amount } },
    });

    const transaction = await tx.credit_transaction.create({
      data: {
        id: generateInternalId(),
        userId: user.id,
        amount: -amount,
        description,
        type: "USAGE",
      },
    });

    creditsExchangedTotal.labels("usage").inc(amount);
    return success({
      newBalance: updatedUser.creditBalance,
      transactionId: transaction.id,
    });
  }

  async refundCreditsInTransaction(
    userId: string,
    amount: number,
    description: string,
    tx: any
  ): Promise<Result<{ newBalance: number; transactionId: string }>> {
    if (amount <= 0) return failure("Le montant doit être positif.", 400);

    const user = await tx.user.findUnique({
      where: { userId },
      select: { id: true, creditBalance: true },
    });

    if (!user) return failure("Utilisateur non trouvé.", 404);

    const updatedUser = await tx.user.update({
      where: { userId },
      data: { creditBalance: { increment: amount } },
    });

    const transaction = await tx.credit_transaction.create({
      data: {
        id: generateInternalId(),
        userId: user.id,
        amount: amount,
        description,
        type: "REFUND",
      },
    });

    creditsExchangedTotal.labels("refund").inc(amount);
    return success({
      newBalance: updatedUser.creditBalance,
      transactionId: transaction.id,
    });
  }

  async creditCredits(
    userId: string,
    amount: number,
    description: string
  ): Promise<Result<CreditOperationResult>> {
    if (amount <= 0) return failure("Le montant doit être positif.", 400);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
          where: { userId },
          select: { id: true, creditBalance: true },
        });

        if (!user) return failure("Utilisateur non trouvé.", 404);

        const MAX_BALANCE = 100_000;
        if (user.creditBalance + amount > MAX_BALANCE) {
          return failure(`Le solde maximal est atteint (100000).`, 400);
        }

        const updatedUser = await tx.user.update({
          where: { userId },
          data: { creditBalance: { increment: amount } },
        });

        const transaction = await tx.credit_transaction.create({
          data: {
            id: generateInternalId(),
            userId: user.id,
            amount: amount,
            description,
            type: "TOP_UP",
          },
        });

        creditsExchangedTotal.labels("top_up").inc(amount);
        return success({
          userId,
          newBalance: updatedUser.creditBalance,
          transactionId: transaction.id,
        });
      });
    } catch (error: any) {
      if (error.ok === false) return error;
      logger.error("Failed to credit credits", error, { userId, amount });
      return failure(error.message || "Une erreur inattendue s'est produite lors de creditCredits. Veuillez réessayer.", 500);
    }
  }

  async refundCredits(
    userId: string,
    amount: number,
    description: string
  ): Promise<Result<CreditOperationResult>> {
    if (amount <= 0) return failure("Le montant doit être positif.", 400);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
          where: { userId },
          select: { id: true, creditBalance: true },
        });

        if (!user) return failure("Utilisateur non trouvé.", 404);

        const updatedUser = await tx.user.update({
          where: { userId },
          data: { creditBalance: { increment: amount } },
        });

        const transaction = await tx.credit_transaction.create({
          data: {
            id: generateInternalId(),
            userId: user.id,
            amount: amount,
            description,
            type: "REFUND",
          },
        });

        creditsExchangedTotal.labels("refund").inc(amount);
        return success({
          userId,
          newBalance: updatedUser.creditBalance,
          transactionId: transaction.id,
        });
      });
    } catch (error: any) {
      if (error.ok === false) return error;
      logger.error("Failed to refund credits", error, { userId, amount });
      return failure(error.message || "Une erreur inattendue s'est produite lors de refundCredits. Veuillez réessayer.", 500);
    }
  }

  async getHistory(
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
  > {
    try {
      const user = await this.prisma.user.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!user) return failure("Utilisateur non trouvé.", 404);

      const [transactions, total] = await Promise.all([
        this.prisma.credit_transaction.findMany({
          where: { userId: user.id },
          take: params?.limit || 50,
          skip: params?.offset || 0,
          orderBy: { createdAt: "desc" },
        }),
        this.prisma.credit_transaction.count({
          where: { userId: user.id },
        }),
      ]);

      return success({
        transactions: transactions.map((t) => ({
          id: t.id,
          amount: t.amount,
          type: t.type as "TOP_UP" | "USAGE" | "REFUND",
          description: t.description,
          createdAt: t.createdAt,
        })),
        total,
      });
    } catch (error) {
      logger.error("Failed to get history", error, { userId, params });
      return failure("Une erreur est survenue lors de la récupération de l'historique.", 500);
    }
  }
}
