import type { Result } from "../../common";
import { failure, success } from "../../common";
import type { IWorkshopRepository } from "../repositories/workshop.repository.interface";
import type { INotificationService } from "../../notifications/services/notification.service.interface";
import type { AppUserRepository } from "../../users/repositories";
import { formatDateTime } from "../utils/date-formatters";
import { logger } from "../../common/logger";
import { handleError, createErrorContext } from "../../common/error-handler";
import { container } from "../../di/container";

export interface WorkshopRescheduleNotificationData {
  workshopId: string;
  workshopTitle: string;
  oldDate: Date | null;
  oldTime: string | null;
  newDate: Date;
  newTime: string;
  apprenticeId: string;
  apprenticeEmail: string | null;
  apprenticeName: string | null;
  apprenticeUserId?: string;
}

export class WorkshopNotificationService {
  constructor(
    private readonly workshopRepository: IWorkshopRepository,
    private readonly dbNotificationService?: INotificationService,
    private readonly appUserRepository?: AppUserRepository
  ) {}

  async notifyWorkshopRescheduled(
    workshopId: string,
    oldDate: Date | null,
    oldTime: string | null,
    newDate: Date,
    newTime: string,
    senderUserId?: string | null
  ): Promise<Result<{ notifiedCount: number }>> {
    try {
      const workshop = await this.workshopRepository.findById(workshopId);
      if (!workshop) {
        return failure("Atelier non trouvé", 404);
      }

      if (!workshop.apprenticeId || !workshop.apprentice) {
        return success({ notifiedCount: 0 });
      }

      let apprenticeUserId = workshop.apprentice.user?.id;
      if (!apprenticeUserId && this.appUserRepository) {
        const apprenticeAppUser = await this.appUserRepository.findByAppUserId(
          workshop.apprentice.id
        );
        if (apprenticeAppUser) {
          apprenticeUserId = apprenticeAppUser.userId;
        }
      }

      const notificationData: WorkshopRescheduleNotificationData = {
        workshopId: workshop.id,
        workshopTitle: workshop.title,
        oldDate,
        oldTime,
        newDate,
        newTime,
        apprenticeId: workshop.apprentice.id,
        apprenticeEmail: workshop.apprentice.user?.email || null,
        apprenticeName: workshop.apprentice.user?.name || null,
        apprenticeUserId: apprenticeUserId || undefined,
      };

      await this.sendRescheduleNotification(notificationData, senderUserId);

      return success({ notifiedCount: 1 });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("notifyWorkshopRescheduled", {
          resourceId: workshopId,
          details: { oldDate, oldTime, newDate, newTime },
        })
      );
    }
  }

  private async sendRescheduleNotification(
    data: WorkshopRescheduleNotificationData,
    senderUserId?: string | null
  ): Promise<void> {
    const oldDateTime = formatDateTime(data.oldDate, data.oldTime, {
      includeWeekday: true,
    });
    const newDateTime = formatDateTime(data.newDate, data.newTime, {
      includeWeekday: true,
    });

    this.logRescheduleNotification(data, oldDateTime, newDateTime);

    if (this.dbNotificationService && data.apprenticeUserId) {
      try {
        await this.dbNotificationService.createNotification(
          data.apprenticeUserId,
          {
            type: "workshop",
            title: "Changement d'horaire",
            message: `L'atelier "${data.workshopTitle}" a été reprogrammé. Ancien horaire: ${oldDateTime}. Nouvel horaire: ${newDateTime}.`,
            actionUrl: `/workshop/${data.workshopId}`,
          },
          senderUserId
        );
      } catch (error) {
        logger.error(
          "Failed to create reschedule notification in database",
          error,
          {
            workshopId: data.workshopId,
            apprenticeUserId: data.apprenticeUserId,
          }
        );
      }
    }

    try {
      let apprenticeEmail = data.apprenticeEmail;

      if (!apprenticeEmail && data.apprenticeUserId) {
        const apprenticeUser = await container.prisma.user.findUnique({
          where: { id: data.apprenticeUserId },
          select: { email: true, name: true },
        });
        apprenticeEmail = apprenticeUser?.email || null;
      }

      if (apprenticeEmail) {
        const workshop = await this.workshopRepository.findById(
          data.workshopId
        );
        const workshopLocation = workshop?.location || "Non spécifié";
        const workshopDuration = workshop?.duration
          ? `${Math.floor(workshop.duration / 60)}h${
              workshop.duration % 60 !== 0
                ? (workshop.duration % 60).toString().padStart(2, "0")
                : ""
            }`
          : "Non spécifié";

        const oldDateFormatted = data.oldDate
          ? new Date(data.oldDate).toLocaleDateString("fr-FR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "Date non définie";
        const newDateFormatted = new Date(data.newDate).toLocaleDateString(
          "fr-FR",
          {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        );

        const emailResult = await container.emailService.sendEmail({
          to: apprenticeEmail,
          subject: `Changement d'horaire - ${data.workshopTitle}`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: #3b82f6; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                  <h1 style="color: white; margin: 0;">Changement d'horaire</h1>
                </div>
                
                <p>Bonjour ${data.apprenticeName || "Participant"},</p>
                
                <p>Nous vous informons que l'atelier <strong>"${
                  data.workshopTitle
                }"</strong> a été reprogrammé.</p>
                
                <div style="background-color: #f1f5f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p style="margin: 0; color: #dc2626; font-weight: bold;">📅 Ancien horaire :</p>
                  <p style="margin: 5px 0 0 0;">${oldDateFormatted} à ${
            data.oldTime || "Heure non définie"
          }</p>
                </div>
                
                <div style="background-color: #dbeafe; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                  <p style="margin: 0; color: #2563eb; font-weight: bold;">📅 Nouvel horaire :</p>
                  <p style="margin: 5px 0 0 0;">${newDateFormatted} à ${
            data.newTime
          }</p>
                </div>
                
                <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p style="margin: 0;"><strong>📍 Lieu :</strong> ${workshopLocation}</p>
                  <p style="margin: 5px 0 0 0;"><strong>⏱️ Durée :</strong> ${workshopDuration}</p>
                </div>
                
                <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                  <p style="margin: 0; font-weight: bold;">⚠️ Action requise</p>
                  <p style="margin: 5px 0 0 0;">Votre participation est maintenue par défaut. Si le nouvel horaire ne vous convient pas, vous pouvez annuler votre inscription depuis votre tableau de bord.</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${
                    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"
                  }/workshop/${data.workshopId}" 
                     style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Voir les détails de l'atelier
                  </a>
                </div>
                
                <p style="margin-top: 30px;">Cordialement,<br>L'équipe LearnSup</p>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                <p style="font-size: 12px; color: #6b7280; text-align: center;">
                  Cet email est envoyé automatiquement, merci de ne pas y répondre.
                </p>
              </body>
            </html>
          `,
          text: `
Changement d'horaire

Bonjour ${data.apprenticeName || "Participant"},

Nous vous informons que l'atelier "${data.workshopTitle}" a été reprogrammé.

📅 Ancien horaire :
${oldDateFormatted} à ${data.oldTime || "Heure non définie"}

📅 Nouvel horaire :
${newDateFormatted} à ${data.newTime}

📍 Lieu : ${workshopLocation}
⏱️ Durée : ${workshopDuration}

⚠️ Action requise
Votre participation est maintenue par défaut. Si le nouvel horaire ne vous convient pas, vous pouvez annuler votre inscription depuis votre tableau de bord.

Voir les détails de l'atelier : ${
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"
          }/workshop/${data.workshopId}

Cordialement,
L'équipe LearnSup
          `.trim(),
        });

        if (!emailResult.ok) {
          logger.error("Failed to send reschedule email", {
            workshopId: data.workshopId,
            apprenticeEmail,
            error: emailResult.error,
          });
        }
      } else {
        logger.warn(
          "Cannot send reschedule email: apprentice email not available",
          {
            workshopId: data.workshopId,
            apprenticeUserId: data.apprenticeUserId,
            apprenticeEmail: data.apprenticeEmail,
          }
        );
      }
    } catch (error) {
      logger.error("Error sending reschedule email", {
        workshopId: data.workshopId,
        error,
      });
    }
  }

  private logRescheduleNotification(
    data: WorkshopRescheduleNotificationData,
    oldDateTime: string,
    newDateTime: string
  ): void {
    const separator = "=".repeat(80);
    const emailContent = [
      separator,
      "📧 EMAIL NOTIFICATION - Workshop Rescheduled",
      separator,
      `To: ${data.apprenticeEmail || "Email non disponible"}`,
      `Subject: Changement d'horaire : ${data.workshopTitle}`,
      "",
      `Bonjour ${data.apprenticeName || "Participant"},`,
      "",
      `L'atelier "${data.workshopTitle}" a été reprogrammé.`,
      "",
      "📅 Ancien horaire:",
      `   ${oldDateTime}`,
      "",
      "📅 Nouvel horaire:",
      `   ${newDateTime}`,
      "",
      "Actions disponibles:",
      "  ✅ Garder ma place (par défaut)",
      "  ❌ Le nouvel horaire ne me convient pas - Annuler mon inscription",
      "",
      `Workshop ID: ${data.workshopId}`,
      `Apprentice ID: ${data.apprenticeId}`,
      separator,
    ].join("\n");

    logger.debug("Workshop reschedule notification sent", {
      workshopId: data.workshopId,
      apprenticeId: data.apprenticeId,
      oldDateTime,
      newDateTime,
    });
  }
}
