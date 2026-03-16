import type { ICreditService } from "../../../credits/services/credit.service.interface";
import type { INotificationService } from "../../../notifications/services/notification.service.interface";
import type { ICashbackQueueRepository } from "../../repositories/cashback/cashback-queue.repository.interface";
import type { Result } from "../../../common";
import { success, failure } from "../../../common";
import { logger } from "../../../common/logger";

export interface ICashbackQueueProcessor {
  processQueuedCashbacks(): Promise<
    Result<{ processed: number; failed: number }>
  >;
  retryFailedCashbacks(): Promise<
    Result<{ retried: number; stillFailed: number }>
  >;
}

export class CashbackQueueProcessor implements ICashbackQueueProcessor {
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_MINUTES = 30;

  constructor(
    private readonly cashbackQueueRepository: ICashbackQueueRepository,
    private readonly creditService: ICreditService,
    private readonly notificationService?: INotificationService
  ) {}

  async processQueuedCashbacks(): Promise<
    Result<{ processed: number; failed: number }>
  > {
    try {
      const now = new Date();

      const queuedTransactions =
        await this.cashbackQueueRepository.findPendingDue(
          now,
          this.RETRY_DELAY_MINUTES
        );

      let processed = 0;
      let failed = 0;

      for (const transaction of queuedTransactions) {
        const result = await this.processSingleTransaction(transaction, now);
        if (result === "processed") processed++;
        else if (result === "failed") failed++;
      }

      return success({ processed, failed });
    } catch (error) {
      logger.error("Error processing queued cashbacks", error);
      return failure(
        error instanceof Error
          ? error.message
          : "Erreur lors du traitement des cashbacks en queue",
        500
      );
    }
  }

  async retryFailedCashbacks(): Promise<
    Result<{ retried: number; stillFailed: number }>
  > {
    try {
      const now = new Date();

      const failedTransactions =
        await this.cashbackQueueRepository.findFailedRetriable(
          this.MAX_RETRIES,
          this.RETRY_DELAY_MINUTES
        );

      let retried = 0;
      let stillFailed = 0;

      for (const transaction of failedTransactions) {
        try {
          await this.cashbackQueueRepository.update(transaction.id, {
            status: "PENDING",
            lastRetryAt: now,
            updatedAt: now,
          });

          const creditResult = await this.creditService.creditCredits(
            transaction.participantUserId,
            transaction.cashbackAmount,
            `Cashback de présence (5%) - Atelier ${transaction.workshopId} (retry)`
          );

          if (creditResult.ok) {
            await this.markAsProcessed(transaction, now);
            retried++;
          } else {
            const outcome = await this.handleCreditFailure(
              transaction,
              creditResult.error,
              now
            );
            if (outcome === "failed") stillFailed++;
          }
        } catch (error) {
          const outcome = await this.handleTransactionError(
            transaction,
            error,
            now
          );
          if (outcome === "failed") stillFailed++;
        }
      }

      return success({ retried, stillFailed });
    } catch (error) {
      logger.error("Error retrying failed cashbacks", error);
      return failure(
        error instanceof Error
          ? error.message
          : "Erreur lors du retry des cashbacks échoués",
        500
      );
    }
  }

  private async processSingleTransaction(
    transaction: any,
    now: Date
  ): Promise<"processed" | "failed" | "retrying"> {
    try {
      const creditResult = await this.creditService.creditCredits(
        transaction.participantUserId,
        transaction.cashbackAmount,
        `Cashback de présence (5%) - Atelier ${transaction.workshopId}`
      );

      if (creditResult.ok) {
        await this.markAsProcessed(transaction, now);
        return "processed";
      }

      return await this.handleCreditFailure(
        transaction,
        creditResult.error,
        now
      );
    } catch (error) {
      return await this.handleTransactionError(transaction, error, now);
    }
  }

  private async markAsProcessed(transaction: any, now: Date): Promise<void> {
    await this.cashbackQueueRepository.update(transaction.id, {
      status: "PROCESSED",
      processedAt: now,
      updatedAt: now,
    });

    await this.sendCashbackNotification(
      transaction.participantUserId,
      transaction.cashbackAmount,
      transaction.workshopId
    );
  }

  private async handleCreditFailure(
    transaction: any,
    errorMessage: string,
    now: Date
  ): Promise<"failed" | "retrying"> {
    const newRetryCount = (transaction.retryCount || 0) + 1;

    if (newRetryCount >= this.MAX_RETRIES) {
      await this.cashbackQueueRepository.update(transaction.id, {
        status: "FAILED",
        retryCount: newRetryCount,
        errorMessage,
        lastRetryAt: now,
        updatedAt: now,
      });
      logger.error("Cashback processing failed after max retries", {
        transactionId: transaction.id,
        retryCount: newRetryCount,
        error: errorMessage,
      });
      return "failed";
    }

    await this.cashbackQueueRepository.update(transaction.id, {
      status: "PENDING",
      retryCount: newRetryCount,
      errorMessage,
      lastRetryAt: now,
      updatedAt: now,
    });
    logger.warn("Cashback processing failed, will retry", {
      transactionId: transaction.id,
      retryCount: newRetryCount,
      maxRetries: this.MAX_RETRIES,
      error: errorMessage,
    });
    return "retrying";
  }

  private async handleTransactionError(
    transaction: any,
    error: unknown,
    now: Date
  ): Promise<"failed" | "retrying"> {
    const newRetryCount = (transaction.retryCount || 0) + 1;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    if (newRetryCount >= this.MAX_RETRIES) {
      await this.cashbackQueueRepository.update(transaction.id, {
        status: "FAILED",
        retryCount: newRetryCount,
        errorMessage,
        lastRetryAt: now,
        updatedAt: now,
      });
      logger.error(
        "Error processing cashback transaction after max retries",
        error,
        { transactionId: transaction.id, retryCount: newRetryCount }
      );
      return "failed";
    }

    await this.cashbackQueueRepository.update(transaction.id, {
      status: "PENDING",
      retryCount: newRetryCount,
      errorMessage,
      lastRetryAt: now,
      updatedAt: now,
    });
    logger.warn("Error processing cashback transaction, will retry", {
      transactionId: transaction.id,
      retryCount: newRetryCount,
      maxRetries: this.MAX_RETRIES,
      error: errorMessage,
    });
    return "retrying";
  }

  private async sendCashbackNotification(
    participantUserId: string,
    cashbackAmount: number,
    workshopId: string
  ): Promise<void> {
    if (!this.notificationService) return;

    await this.notificationService.createNotification(participantUserId, {
      type: "cashback",
      title: "Cashback de présence",
      message: `Atelier terminé ! Présence vérifiée : Vous avez récupéré ${cashbackAmount} crédit${cashbackAmount > 1 ? "s" : ""}.`,
      actionUrl: `/workshop/${workshopId}`,
    });
  }
}
