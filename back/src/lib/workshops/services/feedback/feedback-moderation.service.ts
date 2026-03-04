import type { Result } from "../../../common";
import { failure, success } from "../../../common";
import { handleError, createErrorContext } from "../../../common/error-handler";
import type { IWorkshopFeedbackRepository } from "../../repositories/feedback/workshop-feedback.repository.interface";
import type { IMentorRepository } from "../../../mentors/repositories/mentor.repository.interface";
import type { IEmailService } from "../../../email/services/email.service.interface";
import { WorkshopEmailTemplates } from "../email/workshop-email.templates";
import { INotificationService } from "../../../notifications/services/notification.service.interface";

export interface IFeedbackModerationService {
  reportFeedback(
    userId: string,
    feedbackId: string,
    reason: string
  ): Promise<Result<{ success: boolean }>>;

  getModerationQueue(options?: {
    limit?: number;
    offset?: number;
  }): Promise<Result<any>>;

  approveFeedback(feedbackId: string): Promise<Result<{ success: boolean }>>;

  deleteFeedback(feedbackId: string): Promise<Result<{ success: boolean }>>;

  warnUser(feedbackId: string): Promise<Result<{ success: boolean }>>;

  dismissReport(feedbackId: string): Promise<Result<{ success: boolean }>>;
}

export class FeedbackModerationService implements IFeedbackModerationService {
  constructor(
    private readonly feedbackRepository: IWorkshopFeedbackRepository,
    private readonly mentorRepository: IMentorRepository,
    private readonly emailService: IEmailService,
    private readonly notificationService: INotificationService
  ) {}

  async reportFeedback(
    userId: string,
    feedbackId: string,
    reason: string
  ): Promise<Result<{ success: boolean }>> {
    try {
      const feedback = await this.feedbackRepository.findById(feedbackId);
      if (!feedback) {
        return failure("Avis introuvable", 404);
      }

      const mentor = await this.mentorRepository.findMentorById(userId);
      if (!mentor) {
        return failure("Mentor introuvable", 404);
      }

      if (feedback.mentorId !== mentor.id) {
        return failure("Vous n'êtes pas autorisé à signaler cet avis", 403);
      }

      if (feedback.status === "UNDER_REVIEW") {
        return failure("Cet avis est déjà en cours de modération", 400);
      }

      if (feedback.status === "DELETED") {
        return failure("Cet avis a déjà été supprimé", 400);
      }

      await this.feedbackRepository.updateStatus(
        feedbackId,
        "UNDER_REVIEW",
        userId,
        reason
      );

      // Notify admins
      await this.notificationService.notifyAdmin(
        "NEW_FEEDBACK_MODERATION",
        `Un avis sur l'atelier "${feedback.workshop?.title || 'N/A'}" a été signalé pour modération par le mentor ${mentor.name || userId}.`,
        `/admin/feedback-moderation?feedbackId=${feedbackId}`
      );

      return success({ success: true });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("reportFeedback", {
          userId,
          resourceId: feedbackId,
        })
      );
    }
  }

  async getModerationQueue(options?: {
    limit?: number;
    offset?: number;
  }): Promise<Result<any>> {
    try {
      const [feedbacks, total] = await Promise.all([
        this.feedbackRepository.findUnderReview(options),
        this.feedbackRepository.countUnderReview(),
      ]);

      return success({
        feedbacks: feedbacks.map((feedback: any) => ({
          id: feedback.id,
          rating: feedback.rating,
          comment: feedback.comment,
          isAnonymous: feedback.isAnonymous,
          status: feedback.status,
          reportedAt: feedback.reportedAt,
          reportedBy: feedback.reportedBy,
          reportReason: feedback.reportReason,
          createdAt: feedback.createdAt,
          publicName: feedback.isAnonymous
            ? "Étudiant anonyme"
            : feedback.apprentice?.user?.name || "Anonyme",
          realName: feedback.apprentice?.user?.name || null,
          realEmail: feedback.apprentice?.user?.email || null,
          apprenticeId: feedback.apprenticeId,
          mentorId: feedback.mentorId,
          mentorName: feedback.mentor?.user?.name || null,
          workshopId: feedback.workshopId,
          workshopTitle: feedback.workshop?.title || null,
        })),
        total,
      });
    } catch (error) {
      return handleError(error, createErrorContext("getModerationQueue", {}));
    }
  }

  async approveFeedback(
    feedbackId: string
  ): Promise<Result<{ success: boolean }>> {
    try {
      const feedback = await this.feedbackRepository.findById(feedbackId);
      if (!feedback) {
        return failure("Avis introuvable", 404);
      }

      if (feedback.status !== "UNDER_REVIEW") {
        return failure("Cet avis n'est pas en cours de modération", 400);
      }

      await this.feedbackRepository.updateStatus(feedbackId, "ACTIVE");

      return success({ success: true });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("approveFeedback", {
          resourceId: feedbackId,
        })
      );
    }
  }

  async deleteFeedback(
    feedbackId: string
  ): Promise<Result<{ success: boolean }>> {
    try {
      const feedback = await this.feedbackRepository.findById(feedbackId);
      if (!feedback) {
        return failure("Avis introuvable", 404);
      }

      await this.feedbackRepository.updateStatus(feedbackId, "DELETED");

      return success({ success: true });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("deleteFeedback", {
          resourceId: feedbackId,
        })
      );
    }
  }

  async warnUser(
    feedbackId: string
  ): Promise<Result<{ success: boolean }>> {
    try {
      const feedback = await this.feedbackRepository.findById(feedbackId);
      if (!feedback) {
        return failure("Avis introuvable", 404);
      }

      if (!feedback.apprentice?.user?.email) {
        return failure("Email de l'utilisateur introuvable", 404);
      }

      const template = WorkshopEmailTemplates.feedbackWarning({
        recipientName: feedback.apprentice.user.name || "Utilisateur",
        mentorName: feedback.mentor?.user?.name || "le mentor",
        workshopTitle: feedback.workshop?.title || "l'atelier",
      });

      const emailResult = await this.emailService.sendEmail({
        to: feedback.apprentice.user.email,
        ...template,
      });

      if (!emailResult.ok) {
        return failure("Erreur lors de l'envoi de l'email", 500);
      }

      return success({ success: true });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("warnUser", {
          resourceId: feedbackId,
        })
      );
    }
  }

  async dismissReport(
    feedbackId: string
  ): Promise<Result<{ success: boolean }>> {
    try {
      const feedback = await this.feedbackRepository.findById(feedbackId);
      if (!feedback) {
        return failure("Avis introuvable", 404);
      }

      if (feedback.status !== "UNDER_REVIEW") {
        return failure("Cet avis n'est pas en cours de modération", 400);
      }

      await this.feedbackRepository.updateStatus(feedbackId, "ACTIVE");

      return success({ success: true });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("dismissReport", {
          resourceId: feedbackId,
        })
      );
    }
  }
}
