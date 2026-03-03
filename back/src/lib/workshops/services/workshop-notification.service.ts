import type { Result } from "../../common";
import { failure, success } from "../../common";
import type { IWorkshopRepository } from "../repositories/workshop.repository.interface";
import type { INotificationService } from "../../notifications/services/notification.service.interface";
import type { AppUserRepository } from "../../users/repositories";
import { formatDateTime } from "../utils/date-formatters";
import { logger } from "../../common/logger";
import { handleError, createErrorContext } from "../../common/error-handler";
import { container } from "../../di/container";
import { WorkshopEmailTemplates } from "./email/workshop-email.templates";

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

      const notificationData: WorkshopRescheduleNotificationData = {
        workshopId: workshop.id,
        workshopTitle: workshop.title,
        oldDate,
        oldTime,
        newDate,
        newTime,
        apprenticeId: workshop.apprentice.id,
        apprenticeEmail: workshop.apprentice.email || null,
        apprenticeName: workshop.apprentice.name || null,
        apprenticeUserId: workshop.apprentice.userId,
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

    await this.sendRescheduleEmail(data);
  }

  private async sendRescheduleEmail(
    data: WorkshopRescheduleNotificationData
  ): Promise<void> {
    try {
      let apprenticeEmail = data.apprenticeEmail;

      if (!apprenticeEmail && data.apprenticeUserId) {
        const apprenticeAppUser = await container.prisma.user.findUnique({
          where: { userId: data.apprenticeUserId },
          select: { email: true },
        });
        apprenticeEmail = apprenticeAppUser?.email || null;
      }

      if (!apprenticeEmail) {
        logger.warn(
          "Cannot send reschedule email: apprentice email not available",
          {
            workshopId: data.workshopId,
            apprenticeUserId: data.apprenticeUserId,
          }
        );
        return;
      }

      const workshop = await this.workshopRepository.findById(data.workshopId);

      const emailTemplate = WorkshopEmailTemplates.reschedule({
        recipientName: data.apprenticeName || "Participant",
        workshopTitle: data.workshopTitle,
        oldDate: data.oldDate,
        oldTime: data.oldTime,
        newDate: data.newDate,
        newTime: data.newTime,
        workshopLocation: workshop?.location || "Non spécifié",
        workshopDuration: workshop?.duration ?? null,
        workshopId: data.workshopId,
      });

      const emailResult = await container.emailService.sendEmail({
        to: apprenticeEmail,
        ...emailTemplate,
      });

      if (!emailResult.ok) {
        logger.error("Failed to send reschedule email", {
          workshopId: data.workshopId,
          apprenticeEmail,
          error: emailResult.error,
        });
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
    logger.debug("Workshop reschedule notification sent", {
      workshopId: data.workshopId,
      apprenticeId: data.apprenticeId,
      oldDateTime,
      newDateTime,
    });
  }
}
