import type {
  IWorkshopCashbackService,
  CashbackProcessingDelay,
  ProcessedCashbackReport,
  DataIntegrityIssue,
} from "./workshop-cashback.service.interface";
import type { ICreditService } from "../../../credits/services/credit.service.interface";
import type { INotificationService } from "../../../notifications/services/notification.service.interface";
import type { IWorkshopRepository } from "../../repositories/workshop.repository.interface";
import type { AppUserRepository } from "../../../users/repositories";
import type { ICreditTransactionRepository } from "../../../credits/repositories/credit-transaction.repository.interface";
import type { ICashbackQueueRepository } from "../../repositories/cashback/cashback-queue.repository.interface";
import type { Result } from "../../../common";
import { success, failure } from "../../../common";
import { generateInternalId } from "../../../utils/id-generator";
import { logger } from "../../../common/logger";

export class WorkshopCashbackService implements IWorkshopCashbackService {
  private readonly CASHBACK_PERCENTAGE = 0.05;
  private readonly MIN_CASHBACK = 1;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_MINUTES = 30;
  private readonly DEFAULT_WORKSHOP_PRICE = 20;
  private readonly MIN_WORKSHOP_PRICE = 20;

  constructor(
    private readonly workshopRepository: IWorkshopRepository,
    private readonly appUserRepository: AppUserRepository,
    private readonly creditTransactionRepository: ICreditTransactionRepository,
    private readonly cashbackQueueRepository: ICashbackQueueRepository,
    private readonly creditService: ICreditService,
    private readonly notificationService?: INotificationService
  ) {}

  private async getWorkshopPrice(
    workshopId: string,
    participantUserId: string
  ): Promise<number> {
    const priceFromWorkshop = await this.getPriceFromWorkshop(workshopId);
    if (priceFromWorkshop !== null) {
      return priceFromWorkshop;
    }

    const priceFromTransaction = await this.getPriceFromCreditTransaction(
      workshopId,
      participantUserId
    );
    if (priceFromTransaction !== null) {
      return priceFromTransaction;
    }

    return this.DEFAULT_WORKSHOP_PRICE;
  }

  private async getPriceFromWorkshop(
    workshopId: string
  ): Promise<number | null> {
    const workshop = await this.workshopRepository.findById(workshopId);

    if (workshop?.creditCost && workshop.creditCost > 0) {
      return Math.max(this.MIN_WORKSHOP_PRICE, workshop.creditCost);
    }

    return null;
  }

  private async getPriceFromCreditTransaction(
    workshopId: string,
    participantUserId: string
  ): Promise<number | null> {
    const appUser = await this.appUserRepository.findByUserId(
      participantUserId
    );

    if (!appUser) {
      return null;
    }

    const creditTransaction =
      await this.creditTransactionRepository.findFirstByUserIdAndType(
        appUser.id,
        "USAGE",
        {
          descriptionContains: workshopId,
          orderBy: "desc",
        }
      );

    if (creditTransaction && creditTransaction.amount > 0) {
      const transactionAmount = Math.abs(creditTransaction.amount);
      return Math.max(this.MIN_WORKSHOP_PRICE, transactionAmount);
    }

    return null;
  }

  private calculateCashbackAmount(workshopPrice: number): number {
    const calculatedAmount = workshopPrice * this.CASHBACK_PERCENTAGE;
    return Math.max(this.MIN_CASHBACK, Math.floor(calculatedAmount));
  }

  async processCashback(
    workshopId: string,
    participantUserId: string,
    workshopEndTime: Date
  ): Promise<Result<{ queued: boolean; cashbackAmount: number }>> {
    try {
      const now = new Date();

      const existingQueue =
        await this.cashbackQueueRepository.findFirstByWorkshopAndUser(
          workshopId,
          participantUserId
        );

      if (existingQueue && existingQueue.status === "PROCESSED") {
        logger.info("Cashback already processed", {
          workshopId,
          participantUserId,
          queueId: existingQueue.id,
        });
        return success({
          queued: false,
          cashbackAmount: existingQueue.cashbackAmount,
        });
      }

      const isWorkshopFinished = now >= workshopEndTime;

      const workshopPrice = await this.getWorkshopPrice(
        workshopId,
        participantUserId
      );
      const cashbackAmount = this.calculateCashbackAmount(workshopPrice);

      if (isWorkshopFinished) {
        if (existingQueue && existingQueue.status === "PENDING") {
          const creditResult = await this.creditService.creditCredits(
            participantUserId,
            existingQueue.cashbackAmount,
            `Cashback de présence (5%) - Atelier ${workshopId}`
          );

          if (!creditResult.ok) {
            logger.error("Failed to credit queued cashback", {
              workshopId,
              participantUserId,
              queueId: existingQueue.id,
              cashbackAmount: existingQueue.cashbackAmount,
              error: creditResult.error,
            });
            return failure(
              `Erreur lors du crédit du cashback: ${creditResult.error}`,
              500
            );
          }

          await this.cashbackQueueRepository.update(existingQueue.id, {
            status: "PROCESSED",
            processedAt: now,
            updatedAt: now,
          });

          if (this.notificationService) {
            await this.notificationService.createNotification(
              participantUserId,
              {
                type: "cashback",
                title: "Cashback de présence",
                message: `Atelier terminé ! Présence vérifiée : Vous avez récupéré ${
                  existingQueue.cashbackAmount
                } crédit${existingQueue.cashbackAmount > 1 ? "s" : ""}.`,
                actionUrl: `/workshop/${workshopId}`,
              }
            );
          }

          return success({
            queued: false,
            cashbackAmount: existingQueue.cashbackAmount,
          });
        }

        const creditResult = await this.creditService.creditCredits(
          participantUserId,
          cashbackAmount,
          `Cashback de présence (5%) - Atelier ${workshopId}`
        );

        if (!creditResult.ok) {
          logger.error("Failed to credit cashback", {
            workshopId,
            participantUserId,
            cashbackAmount,
            error: creditResult.error,
          });
          return failure(
            `Erreur lors du crédit du cashback: ${creditResult.error}`,
            500
          );
        }

        if (this.notificationService) {
          await this.notificationService.createNotification(participantUserId, {
            type: "cashback",
            title: "Cashback de présence",
            message: `Atelier terminé ! Présence vérifiée : Vous avez récupéré ${cashbackAmount} crédit${
              cashbackAmount > 1 ? "s" : ""
            }.`,
            actionUrl: `/workshop/${workshopId}`,
          });
        }

        return success({ queued: false, cashbackAmount });
      } else {
        if (!existingQueue || existingQueue.status !== "PENDING") {
          await this.cashbackQueueRepository.create({
            id: generateInternalId(),
            workshopId,
            participantUserId,
            cashbackAmount,
            workshopEndTime,
            status: "PENDING",
            createdAt: now,
            updatedAt: now,
          });
        }

        return success({ queued: true, cashbackAmount });
      }
    } catch (error) {
      logger.error("Error processing cashback", error, {
        workshopId,
        participantUserId,
      });
      return failure(
        error instanceof Error
          ? error.message
          : "Erreur lors du traitement du cashback",
        500
      );
    }
  }

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
        try {
          const creditResult = await this.creditService.creditCredits(
            transaction.participantUserId,
            transaction.cashbackAmount,
            `Cashback de présence (5%) - Atelier ${transaction.workshopId}`
          );

          if (creditResult.ok) {
            await this.cashbackQueueRepository.update(transaction.id, {
              status: "PROCESSED",
              processedAt: now,
              updatedAt: now,
            });

            if (this.notificationService) {
              await this.notificationService.createNotification(
                transaction.participantUserId,
                {
                  type: "cashback",
                  title: "Cashback de présence",
                  message: `Atelier terminé ! Présence vérifiée : Vous avez récupéré ${
                    transaction.cashbackAmount
                  } crédit${transaction.cashbackAmount > 1 ? "s" : ""}.`,
                  actionUrl: `/workshop/${transaction.workshopId}`,
                }
              );
            }

            processed++;
          } else {
            const newRetryCount = (transaction.retryCount || 0) + 1;

            if (newRetryCount < this.MAX_RETRIES) {
              await this.cashbackQueueRepository.update(transaction.id, {
                status: "PENDING",
                retryCount: newRetryCount,
                errorMessage: creditResult.error,
                lastRetryAt: now,
                updatedAt: now,
              });
              logger.warn("Cashback processing failed, will retry", {
                transactionId: transaction.id,
                retryCount: newRetryCount,
                maxRetries: this.MAX_RETRIES,
                error: creditResult.error,
              });
            } else {
              await this.cashbackQueueRepository.update(transaction.id, {
                status: "FAILED",
                retryCount: newRetryCount,
                errorMessage: creditResult.error,
                lastRetryAt: now,
                updatedAt: now,
              });
              failed++;
              logger.error("Cashback processing failed after max retries", {
                transactionId: transaction.id,
                retryCount: newRetryCount,
                error: creditResult.error,
              });
            }
          }
        } catch (error) {
          const newRetryCount = (transaction.retryCount || 0) + 1;
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";

          if (newRetryCount < this.MAX_RETRIES) {
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
          } else {
            await this.cashbackQueueRepository.update(transaction.id, {
              status: "FAILED",
              retryCount: newRetryCount,
              errorMessage,
              lastRetryAt: now,
              updatedAt: now,
            });
            failed++;
            logger.error(
              "Error processing cashback transaction after max retries",
              error,
              {
                transactionId: transaction.id,
                retryCount: newRetryCount,
              }
            );
          }
        }
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

  async getProcessingDelays(options?: {
    startDate?: Date;
    endDate?: Date;
    minDelayMinutes?: number;
    maxDelayMinutes?: number;
  }): Promise<Result<CashbackProcessingDelay[]>> {
    try {
      const transactions =
        await this.cashbackQueueRepository.findProcessedWithProcessedAt(
          options?.startDate,
          options?.endDate
        );

      const delays: CashbackProcessingDelay[] = transactions
        .map((tx) => {
          if (!tx.processedAt) return null;

          const delayMs =
            tx.processedAt.getTime() - tx.workshopEndTime.getTime();
          const delayInMinutes = Math.floor(delayMs / (1000 * 60));
          const delayInHours = Math.floor(delayInMinutes / 60);

          return {
            transactionId: tx.id,
            workshopId: tx.workshopId,
            participantUserId: tx.participantUserId,
            workshopEndTime: tx.workshopEndTime,
            processedAt: tx.processedAt,
            delayInMinutes,
            delayInHours,
          };
        })
        .filter((d: any): d is CashbackProcessingDelay => {
          if (!d) return false;
          if (
            options?.minDelayMinutes &&
            d.delayInMinutes < options.minDelayMinutes
          )
            return false;
          if (
            options?.maxDelayMinutes &&
            d.delayInMinutes > options.maxDelayMinutes
          )
            return false;
          return true;
        });

      return success(delays);
    } catch (error) {
      logger.error("Error getting processing delays", error);
      return failure(
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération des délais de traitement",
        500
      );
    }
  }

  async getProcessedCashbacksByDate(
    date: Date
  ): Promise<Result<ProcessedCashbackReport[]>> {
    try {
      const transactions =
        await this.cashbackQueueRepository.findProcessedByDate(date);

      const reports: ProcessedCashbackReport[] = transactions.map((tx) => ({
        transactionId: tx.id,
        workshopId: tx.workshopId,
        participantUserId: tx.participantUserId,
        cashbackAmount: tx.cashbackAmount,
        workshopEndTime: tx.workshopEndTime,
        processedAt: tx.processedAt!,
        createdAt: tx.createdAt,
      }));

      return success(reports);
    } catch (error) {
      logger.error("Error getting processed cashbacks by date", error);
      return failure(
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération des cashbacks traités",
        500
      );
    }
  }

  async checkDataIntegrity(): Promise<Result<DataIntegrityIssue[]>> {
    try {
      const issues: DataIntegrityIssue[] = [];

      const processedWithoutDate =
        await this.cashbackQueueRepository.findProcessedWithoutProcessedAt();

      for (const tx of processedWithoutDate) {
        issues.push({
          transactionId: tx.id,
          workshopId: tx.workshopId,
          participantUserId: tx.participantUserId,
          status: tx.status,
          issue: "Status is PROCESSED but processedAt is NULL",
        });
      }

      const withDateButNotProcessed =
        await this.cashbackQueueRepository.findNonProcessedWithProcessedAt();

      for (const tx of withDateButNotProcessed) {
        issues.push({
          transactionId: tx.id,
          workshopId: tx.workshopId,
          participantUserId: tx.participantUserId,
          status: tx.status,
          issue: `processedAt is set but status is ${tx.status} (expected PROCESSED)`,
        });
      }

      if (issues.length > 0) {
        logger.warn("Data integrity issues found in cashback queue", {
          issueCount: issues.length,
          issues: issues.map((i) => ({
            transactionId: i.transactionId,
            issue: i.issue,
          })),
        });
      }

      return success(issues);
    } catch (error) {
      logger.error("Error checking data integrity", error);
      return failure(
        error instanceof Error
          ? error.message
          : "Erreur lors de la vérification de l'intégrité des données",
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
            await this.cashbackQueueRepository.update(transaction.id, {
              status: "PROCESSED",
              processedAt: now,
              updatedAt: now,
            });

            if (this.notificationService) {
              await this.notificationService.createNotification(
                transaction.participantUserId,
                {
                  type: "cashback",
                  title: "Cashback de présence",
                  message: `Atelier terminé ! Présence vérifiée : Vous avez récupéré ${
                    transaction.cashbackAmount
                  } crédit${transaction.cashbackAmount > 1 ? "s" : ""}.`,
                  actionUrl: `/workshop/${transaction.workshopId}`,
                }
              );
            }

            retried++;
          } else {
            const newRetryCount = (transaction.retryCount || 0) + 1;

            if (newRetryCount >= this.MAX_RETRIES) {
              await this.cashbackQueueRepository.update(transaction.id, {
                status: "FAILED",
                retryCount: newRetryCount,
                errorMessage: creditResult.error,
                lastRetryAt: now,
                updatedAt: now,
              });
              stillFailed++;
            } else {
              await this.cashbackQueueRepository.update(transaction.id, {
                status: "PENDING",
                retryCount: newRetryCount,
                errorMessage: creditResult.error,
                lastRetryAt: now,
                updatedAt: now,
              });
            }

            logger.warn("Retry failed for cashback transaction", {
              transactionId: transaction.id,
              retryCount: newRetryCount,
              error: creditResult.error,
            });
          }
        } catch (error) {
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
            stillFailed++;
          } else {
            await this.cashbackQueueRepository.update(transaction.id, {
              status: "PENDING",
              retryCount: newRetryCount,
              errorMessage,
              lastRetryAt: now,
              updatedAt: now,
            });
          }

          logger.error("Error retrying failed cashback transaction", error, {
            transactionId: transaction.id,
            retryCount: newRetryCount,
          });
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
}
