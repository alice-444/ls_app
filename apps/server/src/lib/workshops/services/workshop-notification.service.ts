import type { Result } from "../../common";
import { failure, success } from "../../common";
import type { IWorkshopRepository } from "../repositories/workshop.repository.interface";
import { formatDateTime } from "../utils/date-formatters";

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
}

export class WorkshopNotificationService {
  constructor(private readonly workshopRepository: IWorkshopRepository) {}

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

    // TODO: Integration with a mailing service (SendGrid, Resend, etc.)
    // TODO: Create a notification in the database for the dashboard
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

    console.log(emailContent);
  }
}
