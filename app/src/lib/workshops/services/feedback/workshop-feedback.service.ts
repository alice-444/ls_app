import type { Result } from "../../../common";
import { failure, success } from "../../../common";
import { handleError, createErrorContext } from "../../../common/error-handler";
import type {
  IWorkshopFeedbackService,
  SubmitFeedbackInput,
  WorkshopFeedbackEntity,
} from "./workshop-feedback.service.interface";
import type { IWorkshopService } from "../workshop.service.interface";
import type { IWorkshopFeedbackRepository } from "../../repositories/feedback/workshop-feedback.repository.interface";
import type { ICreditService } from "../../../credits/services/credit.service.interface";
import type { INotificationService } from "../../../notifications/services/notification.service.interface";
import { calculateWorkshopEndTime } from "../../utils/workshop-helpers";
import { logger } from "../../../common/logger";
import { generateInternalId } from "../../../utils/id-generator";

export class WorkshopFeedbackService implements IWorkshopFeedbackService {
  constructor(
    private readonly feedbackRepository: IWorkshopFeedbackRepository,
    private readonly workshopService: IWorkshopService,
    private readonly creditService: ICreditService,
    private readonly notificationService: INotificationService
  ) {}

  async canSubmitFeedback(
    userId: string,
    workshopId: string
  ): Promise<Result<{ canSubmit: boolean; reason?: string }>> {
    try {
      const workshopResult =
        await this.workshopService.getWorkshopById(workshopId);
      if (!workshopResult.ok) {
        return success({ canSubmit: false, reason: "Atelier introuvable" });
      }
      const workshop = workshopResult.data;

      // Ensure user was an apprentice in this workshop
      if (workshop.apprentice?.userId !== userId) {
        return success({
          canSubmit: false,
          reason: "Vous n'avez pas participé à cet atelier",
        });
      }

      if (workshop.status !== "COMPLETED" && workshop.status !== "PUBLISHED") {
        return success({
          canSubmit: false,
          reason: "L'atelier n'est pas encore terminé",
        });
      }

      if (workshop.date && workshop.time && workshop.duration) {
        const endTime = calculateWorkshopEndTime(
          workshop.date,
          workshop.time,
          workshop.duration
        );
        if (endTime && endTime > new Date()) {
          return success({
            canSubmit: false,
            reason: "L'atelier n'est pas encore terminé",
          });
        }
      }

      const existingFeedback =
        await this.feedbackRepository.findByApprenticeIdAndWorkshopId(
          workshop.apprenticeId!,
          workshopId
        );
      if (existingFeedback) {
        return success({
          canSubmit: false,
          reason: "Vous avez déjà laissé un avis pour cet atelier",
        });
      }

      return success({ canSubmit: true });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("canSubmitFeedback", {
          userId,
          resourceId: workshopId,
        })
      );
    }
  }

  async submitFeedback(
    userId: string,
    input: SubmitFeedbackInput
  ): Promise<
    Result<{
      feedbackId: string;
      mentorUserId: string | null;
      creditRewarded: boolean;
    }>
  > {
    try {
      const canSubmitResult = await this.canSubmitFeedback(
        userId,
        input.workshopId
      );
      if (!canSubmitResult.ok || !canSubmitResult.data.canSubmit) {
        return failure(
          canSubmitResult.ok
            ? canSubmitResult.data.reason!
            : canSubmitResult.error,
          400
        );
      }

      const workshopResult = await this.workshopService.getWorkshopById(
        input.workshopId
      );
      if (!workshopResult.ok) {
        return failure("Atelier introuvable", 404);
      }
      const workshop = workshopResult.data;

      const feedback = await this.feedbackRepository.create({
        workshopId: input.workshopId,
        apprenticeId: workshop.apprenticeId!,
        mentorId: workshop.creatorId,
        rating: input.rating,
        comment: input.comment || null,
        isAnonymous: input.isAnonymous || false,
      });

      // Reward credit
      let creditRewarded = false;
      try {
        await this.creditService.creditCredits(
          userId,
          1,
          "Récompense pour avis"
        );
        creditRewarded = true;
      } catch (error) {
        logger.error("Failed to reward credit for feedback", { userId, error });
      }

      // Notify mentor
      await this.notificationService.createNotification(workshop.creatorId, {
        type: "workshop",
        title: "Nouvel avis reçu",
        message: `Vous avez reçu un avis de ${input.isAnonymous ? "un étudiant anonyme" : (workshop.apprentice?.name || "un étudiant")} pour l'atelier "${workshop.title}".`,
        actionUrl: `/workshop/${workshop.id}`,
      });

      return success({ 
        feedbackId: feedback.id,
        mentorUserId: workshop.creatorId,
        creditRewarded
      });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("submitFeedback", {
          userId,
          resourceId: input.workshopId,
        })
      );
    }
  }

  async getFeedbackByWorkshop(
    workshopId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<Result<any>> {
    return success(await this.feedbackRepository.findByWorkshopId(workshopId));
  }

  async reportFeedback(
    userId: string,
    feedbackId: string,
    reason: string
  ): Promise<Result<{ success: boolean }>> {
    return success({ success: true });
  }

  async getModerationQueue(options?: {
    limit?: number;
    offset?: number;
  }): Promise<Result<any>> {
    return success([]);
  }

  approveFeedback(feedbackId: string): Promise<Result<{ success: boolean }>> {
    return Promise.resolve(success({ success: true }));
  }

  deleteFeedback(feedbackId: string): Promise<Result<{ success: boolean }>> {
    return Promise.resolve(success({ success: true }));
  }

  warnUser(feedbackId: string): Promise<Result<{ success: boolean }>> {
    return Promise.resolve(success({ success: true }));
  }

  async getEligibleWorkshopsForFeedback(userId: string): Promise<
    Result<
      Array<{
        workshopId: string;
        workshopTitle: string;
        workshopEndTime: Date;
        hoursSinceEnd: number;
        shouldShowImmediately: boolean;
      }>
    >
  > {
    return success([]);
  }

  async getWorkshopFeedbacks(
    workshopId: string
  ): Promise<Result<WorkshopFeedbackEntity[]>> {
    try {
      const feedbacks = await this.feedbackRepository.findByWorkshopId(
        workshopId
      );
      return success(feedbacks as WorkshopFeedbackEntity[]);
    } catch (error) {
      return handleError(
        error,
        createErrorContext("getWorkshopFeedbacks", {
          resourceId: workshopId,
        })
      );
    }
  }
}
