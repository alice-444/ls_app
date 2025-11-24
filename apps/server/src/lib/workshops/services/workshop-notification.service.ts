import type { Result } from "../../common";
import { failure, success } from "../../common";
import type { IWorkshopRepository } from "../repositories/workshop.repository.interface";
import type { INotificationService } from "../../notifications/services/notification.service.interface";
import type { AppUserRepository } from "../../users/repositories";
import { formatDateTime } from "../utils/date-formatters";
import { logger } from "../../common/logger";

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
    newTime: string
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

      await this.sendRescheduleNotification(notificationData);

      return success({ notifiedCount: 1 });
    } catch (error) {
      return failure((error as Error).message, 500);
    }
  }

  private async sendRescheduleNotification(
    data: WorkshopRescheduleNotificationData
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
          }
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

    // TODO: Integration with a mailing service (SendGrid, Resend, etc.)
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
