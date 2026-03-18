import type {
  IWorkshopCashbackService,
  CashbackProcessingDelay,
  ProcessedCashbackReport,
  DataIntegrityIssue,
  CashbackSummary,
  CashbackItem,
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
import { CashbackCalculator } from "./cashback-calculator";
import type { ICashbackCalculator } from "./cashback-calculator";
import { CashbackQueueProcessor } from "./cashback-queue-processor";
import type { ICashbackQueueProcessor } from "./cashback-queue-processor";

export class WorkshopCashbackService implements IWorkshopCashbackService {
  private readonly calculator: ICashbackCalculator;
  private readonly queueProcessor: ICashbackQueueProcessor;

  constructor(
    private readonly workshopRepository: IWorkshopRepository,
    appUserRepository: AppUserRepository,
    creditTransactionRepository: ICreditTransactionRepository,
    private readonly cashbackQueueRepository: ICashbackQueueRepository,
    private readonly creditService: ICreditService,
    private readonly notificationService?: INotificationService
  ) {
    this.calculator = new CashbackCalculator(
      workshopRepository,
      appUserRepository,
      creditTransactionRepository
    );
    this.queueProcessor = new CashbackQueueProcessor(
      cashbackQueueRepository,
      creditService,
      notificationService
    );
  }

  async processCashback(
    workshopId: string,
    participantUserId: string,
    workshopEndTime: Date
  ): Promise<Result<{ queued: boolean; cashbackAmount: number }>> {
    try {
      const validationResult = await this.validateCashbackEligibility(
        workshopId,
        participantUserId
      );
      if (!validationResult.ok) return validationResult;

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

      const now = new Date();
      const isWorkshopFinished = now >= workshopEndTime;

      const workshopPrice = await this.calculator.getWorkshopPrice(
        workshopId,
        participantUserId
      );
      const cashbackAmount =
        this.calculator.calculateCashbackAmount(workshopPrice);

      if (isWorkshopFinished) {
        return this.processImmediateCashback(
          workshopId,
          participantUserId,
          cashbackAmount,
          existingQueue
        );
      }

      return this.queueCashback(
        workshopId,
        participantUserId,
        cashbackAmount,
        workshopEndTime,
        existingQueue
      );
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

  processQueuedCashbacks(): Promise<
    Result<{ processed: number; failed: number }>
  > {
    return this.queueProcessor.processQueuedCashbacks();
  }

  retryFailedCashbacks(): Promise<
    Result<{ retried: number; stillFailed: number }>
  > {
    return this.queueProcessor.retryFailedCashbacks();
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

  private async validateCashbackEligibility(
    workshopId: string,
    participantUserId: string
  ): Promise<Result<{ queued: boolean; cashbackAmount: number }>> {
    const workshop = await this.workshopRepository.findById(workshopId);
    if (!workshop) {
      return failure("Atelier introuvable", 404);
    }
    if (!workshop.apprenticeId || !workshop.apprentice) {
      return failure("Aucun participant inscrit à cet atelier", 400);
    }
    if (workshop.apprentice.userId !== participantUserId) {
      return failure(
        "L'utilisateur n'est pas le participant de cet atelier",
        403
      );
    }
    if (workshop.apprenticeAttendanceStatus !== "PRESENT") {
      return failure(
        "Le cashback n'est attribué qu'après confirmation de présence par le mentor",
        400
      );
    }
    return success({ queued: false, cashbackAmount: 0 });
  }

  private async processImmediateCashback(
    workshopId: string,
    participantUserId: string,
    cashbackAmount: number,
    existingQueue: any
  ): Promise<Result<{ queued: boolean; cashbackAmount: number }>> {
    const amount = existingQueue?.status === "PENDING"
      ? existingQueue.cashbackAmount
      : cashbackAmount;

    const creditResult = await this.creditService.creditCredits(
      participantUserId,
      amount,
      `Cashback de présence (5%) - Atelier ${workshopId}`
    );

    if (!creditResult.ok) {
      logger.error("Failed to credit cashback", {
        workshopId,
        participantUserId,
        cashbackAmount: amount,
        error: creditResult.error,
      });
      return failure(
        `Erreur lors du crédit du cashback: ${creditResult.error}`,
        500
      );
    }

    if (existingQueue) {
      const now = new Date();
      await this.cashbackQueueRepository.update(existingQueue.id, {
        status: "PROCESSED",
        processedAt: now,
        updatedAt: now,
      });
    }

    await this.sendCashbackNotification(
      participantUserId,
      amount,
      workshopId
    );

    return success({ queued: false, cashbackAmount: amount });
  }

  private async queueCashback(
    workshopId: string,
    participantUserId: string,
    cashbackAmount: number,
    workshopEndTime: Date,
    existingQueue: any
  ): Promise<Result<{ queued: boolean; cashbackAmount: number }>> {
    if (!existingQueue || existingQueue.status !== "PENDING") {
      const now = new Date();
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

  async getSummary(
    mentorId: string,
    options?: { from?: Date; to?: Date }
  ): Promise<Result<CashbackSummary>> {
    try {
      const summary = await this.cashbackQueueRepository.findSummaryByMentor(
        mentorId,
        options?.from,
        options?.to
      );
      return success(summary);
    } catch (error) {
      logger.error("Error getting cashback summary", error, { mentorId });
      return failure(
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération du résumé des cashbacks",
        500
      );
    }
  }

  async getHistory(
    mentorId: string,
    options?: { limit?: number; cursor?: string }
  ): Promise<Result<{ items: CashbackItem[]; nextCursor?: string }>> {
    try {
      const history = await this.cashbackQueueRepository.findHistoryByMentor(
        mentorId,
        options
      );

      const items: CashbackItem[] = history.items.map((item) => ({
        id: item.id,
        workshopId: item.workshopId,
        workshopTitle: item.workshopTitle,
        participantUserId: item.participantUserId,
        participantName: item.participantName,
        cashbackAmount: item.cashbackAmount,
        status: item.status,
        processedAt: item.processedAt,
        createdAt: item.createdAt,
      }));

      return success({
        items,
        nextCursor: history.nextCursor,
      });
    } catch (error) {
      logger.error("Error getting cashback history", error, { mentorId });
      return failure(
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération de l'historique des cashbacks",
        500
      );
    }
  }
}
