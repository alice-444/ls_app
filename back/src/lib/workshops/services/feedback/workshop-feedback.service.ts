import type { Result } from "../../../common";
import { failure, success } from "../../../common";
import { handleError, createErrorContext } from "../../../common/error-handler";
import type { IWorkshopFeedbackService } from "./workshop-feedback.service.interface";
import type { IWorkshopFeedbackRepository } from "../../repositories/feedback/workshop-feedback.repository.interface";
import type { IWorkshopRepository } from "../../repositories/workshop.repository.interface";
import type { IMentorRepository } from "../../../mentors/repositories/mentor.repository.interface";
import type { ICreditService } from "../../../credits/services/credit.service.interface";
import type { IEmailService } from "../../../email/services/email.service.interface";
import type { INotificationService } from "../../../notifications/services/notification.service.interface";
import { FeedbackModerationService } from "./feedback-moderation.service";
import type { IFeedbackModerationService } from "./feedback-moderation.service";
import { container } from "../../../di/container";
import { logger } from "../../../common/logger";

export class WorkshopFeedbackService implements IWorkshopFeedbackService {
  private readonly moderationService: IFeedbackModerationService;

  constructor(
    private readonly feedbackRepository: IWorkshopFeedbackRepository,
    private readonly workshopRepository: IWorkshopRepository,
    private readonly mentorRepository: IMentorRepository,
    private readonly notificationService: INotificationService,
    private readonly creditService?: ICreditService,
    emailService?: IEmailService
  ) {
    const resolvedEmailService = emailService ?? container.emailService;
    this.moderationService = new FeedbackModerationService(
      feedbackRepository,
      mentorRepository,
      resolvedEmailService,
      notificationService
    );
  }

  async canSubmitFeedback(
    userId: string,
    workshopId: string
  ): Promise<Result<{ canSubmit: boolean; reason?: string }>> {
    try {
      const workshop = await this.workshopRepository.findById(workshopId);
      if (!workshop) {
        return success({ canSubmit: false, reason: "Atelier introuvable" });
      }

      const apprentice =
        await this.mentorRepository.findApprenticeByUserId(userId);
      if (!apprentice) {
        return success({
          canSubmit: false,
          reason: "Seuls les apprentis peuvent noter un atelier",
        });
      }

      if (workshop.apprenticeId !== apprentice.id) {
        return success({
          canSubmit: false,
          reason: "Vous n'êtes pas inscrit à cet atelier",
        });
      }

      if (!workshop.date || !workshop.time) {
        return success({
          canSubmit: false,
          reason: "L'atelier n'a pas encore de date/heure définie",
        });
      }

      const workshopEndTime = this.calculateWorkshopEndTime(
        workshop.date,
        workshop.time,
        workshop.duration
      );

      if (workshopEndTime > new Date()) {
        return success({
          canSubmit: false,
          reason: "L'atelier n'est pas encore terminé",
        });
      }

      const existingFeedback =
        await this.feedbackRepository.findByApprenticeIdAndWorkshopId(
          apprentice.id,
          workshopId
        );

      if (existingFeedback) {
        return success({
          canSubmit: false,
          reason: "Vous avez déjà soumis un avis pour cet atelier",
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
    input: {
      workshopId: string;
      rating: number;
      comment?: string | null;
      isAnonymous: boolean;
    }
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
      if (!canSubmitResult.ok) {
        return canSubmitResult;
      }

      if (!canSubmitResult.data.canSubmit) {
        return failure(
          canSubmitResult.data.reason || "Impossible de soumettre un avis",
          400
        );
      }

      if (input.rating < 1 || input.rating > 5) {
        return failure("La note doit être entre 1 et 5", 400);
      }

      const apprentice =
        await this.mentorRepository.findApprenticeByUserId(userId);
      if (!apprentice) {
        return failure("Apprenti introuvable", 404);
      }

      const workshop = await this.workshopRepository.findById(input.workshopId);
      if (!workshop) {
        return failure("Atelier introuvable", 404);
      }

      const feedback = await this.feedbackRepository.create({
        mentorId: workshop.creatorId,
        apprenticeId: apprentice.id,
        workshopId: input.workshopId,
        rating: input.rating,
        comment: input.comment ?? null,
        isAnonymous: input.isAnonymous,
      });

      if (this.creditService) {
        const creditResult = await this.creditService.creditCredits(
          userId,
          1,
          `Récompense pour avis - Atelier ${input.workshopId}`
        );
        if (!creditResult.ok) {
          logger.error("Failed to credit feedback reward", {
            userId,
            workshopId: input.workshopId,
            error: creditResult.error,
          });
        }
      }

      const mentorAppUser = await (
        container.prisma as any
      ).app_user.findUnique({
        where: { id: workshop.creatorId },
        select: { userId: true },
      });

      return success({
        feedbackId: feedback.id,
        mentorUserId: mentorAppUser?.userId || null,
        creditRewarded: true,
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
    options?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<Result<any>> {
    try {
      const feedbacks = await this.feedbackRepository.findByWorkshopId(
        workshopId,
        options
      );

      return success({
        feedbacks: feedbacks.map((feedback: any) => ({
          id: feedback.id,
          rating: feedback.rating,
          comment: feedback.comment,
          isAnonymous: feedback.isAnonymous,
          createdAt: feedback.createdAt,
          apprentice: feedback.isAnonymous
            ? { id: null, name: "Étudiant anonyme", image: null }
            : {
                id: feedback.apprentice?.user?.id || null,
                name: feedback.apprentice?.user?.name || "Anonyme",
                image: feedback.apprentice?.user?.image || null,
              },
        })),
      });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("getFeedbackByWorkshop", {
          resourceId: workshopId,
        })
      );
    }
  }

  reportFeedback(
    userId: string,
    feedbackId: string,
    reason: string
  ): Promise<Result<{ success: boolean }>> {
    return this.moderationService.reportFeedback(userId, feedbackId, reason);
  }

  getModerationQueue(options?: {
    limit?: number;
    offset?: number;
  }): Promise<Result<any>> {
    return this.moderationService.getModerationQueue(options);
  }

  approveFeedback(feedbackId: string): Promise<Result<{ success: boolean }>> {
    return this.moderationService.approveFeedback(feedbackId);
  }

  deleteFeedback(feedbackId: string): Promise<Result<{ success: boolean }>> {
    return this.moderationService.deleteFeedback(feedbackId);
  }

  warnUser(feedbackId: string): Promise<Result<{ success: boolean }>> {
    return this.moderationService.warnUser(feedbackId);
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
    try {
      const apprentice =
        await this.mentorRepository.findApprenticeByUserId(userId);
      if (!apprentice) {
        return success([]);
      }

      const now = new Date();

      const workshops = await this.workshopRepository.findByApprenticeId(
        apprentice.id
      );

      const eligibleWorkshops: Array<{
        workshopId: string;
        workshopTitle: string;
        workshopEndTime: Date;
        hoursSinceEnd: number;
        shouldShowImmediately: boolean;
      }> = [];

      for (const workshop of workshops) {
        if (!workshop.date || !workshop.time) continue;

        const workshopEndTime = this.calculateWorkshopEndTime(
          workshop.date,
          workshop.time,
          workshop.duration
        );

        if (workshopEndTime > now) continue;
        if (workshop.apprenticeAttendanceStatus !== "PRESENT") continue;

        const existingFeedback =
          await this.feedbackRepository.findByApprenticeIdAndWorkshopId(
            apprentice.id,
            workshop.id
          );

        if (existingFeedback) continue;

        const hoursSinceEnd =
          (now.getTime() - workshopEndTime.getTime()) / (1000 * 60 * 60);

        const oneHourInMs = 60 * 60 * 1000;
        const shouldShowImmediately =
          now >= workshopEndTime &&
          now < new Date(workshopEndTime.getTime() + oneHourInMs);

        eligibleWorkshops.push({
          workshopId: workshop.id,
          workshopTitle: workshop.title,
          workshopEndTime,
          hoursSinceEnd: Math.floor(hoursSinceEnd * 100) / 100,
          shouldShowImmediately,
        });
      }

      eligibleWorkshops.sort(
        (a, b) => b.workshopEndTime.getTime() - a.workshopEndTime.getTime()
      );

      return success(eligibleWorkshops);
    } catch (error) {
      return handleError(
        error,
        createErrorContext("getEligibleWorkshopsForFeedback", { userId })
      );
    }
  }

  private calculateWorkshopEndTime(
    date: Date | string,
    time: string,
    duration: number | null
  ): Date {
    const workshopDate =
      typeof date === "string" ? new Date(date) : new Date(date);
    const [hours, minutes] = time.split(":").map(Number);
    const startTime = new Date(workshopDate);
    startTime.setHours(hours, minutes, 0, 0);

    const endTime = new Date(startTime);
    if (duration) {
      endTime.setMinutes(endTime.getMinutes() + duration);
    } else {
      endTime.setHours(endTime.getHours() + 1);
    }

    return endTime;
  }
}
