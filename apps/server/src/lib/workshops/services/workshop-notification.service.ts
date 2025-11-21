import type { Result } from "../../common";
import { failure, success } from "../../common";
import type { IWorkshopRepository } from "../repositories/workshop.repository.interface";

function formatDate(
  date: Date | null,
  options?: { includeWeekday?: boolean }
): string {
  if (!date) return "Non définie";
  return date.toLocaleDateString("fr-FR", {
    ...(options?.includeWeekday && { weekday: "long" }),
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(time: string | null): string {
  if (!time) return "Non définie";
  return time;
}

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
    const oldDateTime =
      data.oldDate && data.oldTime
        ? `${formatDate(data.oldDate, { includeWeekday: true })} à ${formatTime(
            data.oldTime
          )}`
        : "Non défini";

    const newDateTime = `${formatDate(data.newDate, {
      includeWeekday: true,
    })} à ${formatTime(data.newTime)}`;

    // TODO: Integration with realtime system of notifications and mail service will be implemented later
    console.log("=".repeat(80));
    console.log("📧 EMAIL NOTIFICATION - Workshop Rescheduled");
    console.log("=".repeat(80));
    console.log(`To: ${data.apprenticeEmail || "Email non disponible"}`);
    console.log(`Subject: Changement d'horaire : ${data.workshopTitle}`);
    console.log("");
    console.log(`Bonjour ${data.apprenticeName || "Participant"},`);
    console.log("");
    console.log(`L'atelier "${data.workshopTitle}" a été reprogrammé.`);
    console.log("");
    console.log("📅 Ancien horaire:");
    console.log(`   ${oldDateTime}`);
    console.log("");
    console.log("📅 Nouvel horaire:");
    console.log(`   ${newDateTime}`);
    console.log("");
    console.log("Actions disponibles:");
    console.log("  ✅ Garder ma place (par défaut)");
    console.log(
      "  ❌ Le nouvel horaire ne me convient pas - Annuler mon inscription"
    );
    console.log("");
    console.log(`Workshop ID: ${data.workshopId}`);
    console.log(`Apprentice ID: ${data.apprenticeId}`);
    console.log("=".repeat(80));

    // TODO: Integration with a mailing service (SendGrid, Resend, etc.)
    // TODO: Create a notification in the database for the dashboard
  }
}
