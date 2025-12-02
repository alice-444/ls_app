import type { Result } from "../../../common";
import { failure, success } from "../../../common";
import { handleError, createErrorContext } from "../../../common/error-handler";
import type { IWorkshopFeedbackService } from "./workshop-feedback.service.interface";
import type { IWorkshopFeedbackRepository } from "../../repositories/feedback/workshop-feedback.repository.interface";
import type { IWorkshopRepository } from "../../repositories/workshop.repository.interface";
import type { IMentorRepository } from "../../../mentors/repositories/mentor.repository.interface";
import type { ICreditService } from "../../../credits/services/credit.service.interface";
import { container } from "../../../di/container";
import { logger } from "../../../common/logger";

export class WorkshopFeedbackService implements IWorkshopFeedbackService {
  constructor(
    private readonly feedbackRepository: IWorkshopFeedbackRepository,
    private readonly workshopRepository: IWorkshopRepository,
    private readonly mentorRepository: IMentorRepository,
    private readonly creditService?: ICreditService
  ) {}

  async canSubmitFeedback(
    userId: string,
    workshopId: string
  ): Promise<Result<{ canSubmit: boolean; reason?: string }>> {
    try {
      const workshop = await this.workshopRepository.findById(workshopId);
      if (!workshop) {
        return success({ canSubmit: false, reason: "Atelier introuvable" });
      }

      const apprentice = await this.mentorRepository.findApprenticeByUserId(
        userId
      );
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

      const apprentice = await this.mentorRepository.findApprenticeByUserId(
        userId
      );
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

      const mentorAppUser = await (container.prisma as any).app_user.findUnique(
        {
          where: { id: workshop.creatorId },
          select: { userId: true },
        }
      );

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
            ? {
                id: null,
                name: "Étudiant anonyme",
                image: null,
              }
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

  async warnUser(feedbackId: string): Promise<Result<{ success: boolean }>> {
    try {
      const feedback = await this.feedbackRepository.findById(feedbackId);
      if (!feedback) {
        return failure("Avis introuvable", 404);
      }

      if (!feedback.apprentice?.user?.email) {
        return failure("Email de l'utilisateur introuvable", 404);
      }

      const apprenticeName = feedback.apprentice.user.name || "Utilisateur";
      const mentorName = feedback.mentor?.user?.name || "le mentor";
      const workshopTitle = feedback.workshop?.title || "l'atelier";

      const emailResult = await container.emailService.sendEmail({
        to: feedback.apprentice.user.email,
        subject: "Avertissement - Avis signalé",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #dc2626; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">Avertissement officiel</h1>
              </div>
              
              <p>Bonjour ${apprenticeName},</p>
              
              <p>Nous vous informons qu'un avis que vous avez laissé pour l'atelier <strong>"${workshopTitle}"</strong> avec ${mentorName} a été signalé et examiné par notre équipe de modération.</p>
              
              <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; font-weight: bold;">⚠️ Avertissement</p>
                <p style="margin: 5px 0 0 0;">Votre avis a été jugé inapproprié et ne respecte pas nos règles de communauté. Nous vous rappelons que tous les avis doivent être respectueux et constructifs.</p>
              </div>
              
              <div style="background-color: #f1f5f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0; font-weight: bold;">📋 Règles de la communauté :</p>
                <ul style="margin: 5px 0 0 0; padding-left: 20px;">
                  <li>Respectez les autres membres de la communauté</li>
                  <li>Fournissez des avis constructifs et honnêtes</li>
                  <li>Évitez les propos injurieux, discriminatoires ou diffamatoires</li>
                  <li>Ne publiez pas de contenu spam ou trompeur</li>
                </ul>
              </div>
              
              <p>Nous vous encourageons à réfléchir à votre comportement et à respecter nos règles à l'avenir. En cas de récidive, des mesures supplémentaires pourront être prises.</p>
              
              <p style="margin-top: 30px;">Cordialement,<br>L'équipe de modération LearnSup</p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="font-size: 12px; color: #6b7280; text-align: center;">
                Cet email est envoyé automatiquement, merci de ne pas y répondre.
              </p>
            </body>
          </html>
        `,
        text: `
Avertissement officiel

Bonjour ${apprenticeName},

Nous vous informons qu'un avis que vous avez laissé pour l'atelier "${workshopTitle}" avec ${mentorName} a été signalé et examiné par notre équipe de modération.

⚠️ Avertissement
Votre avis a été jugé inapproprié et ne respecte pas nos règles de communauté. Nous vous rappelons que tous les avis doivent être respectueux et constructifs.

📋 Règles de la communauté :
- Respectez les autres membres de la communauté
- Fournissez des avis constructifs et honnêtes
- Évitez les propos injurieux, discriminatoires ou diffamatoires
- Ne publiez pas de contenu spam ou trompeur

Nous vous encourageons à réfléchir à votre comportement et à respecter nos règles à l'avenir. En cas de récidive, des mesures supplémentaires pourront être prises.

Cordialement,
L'équipe de modération LearnSup
        `.trim(),
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
      const apprentice = await this.mentorRepository.findApprenticeByUserId(
        userId
      );
      if (!apprentice) {
        return success([]);
      }

      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

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
          now >= workshopEndTime && now < new Date(workshopEndTime.getTime() + oneHourInMs);

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
        createErrorContext("getEligibleWorkshopsForFeedback", {
          userId,
        })
      );
    }
  }
}
