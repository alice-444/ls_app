import type { INotificationService } from "../../../notifications/services/notification.service.interface";
import type { IEmailService } from "../../../email/services/email.service.interface";
import type { IWorkshopRequestRepository } from "../../repositories/workshop-request.repository.interface";
import type { IWorkshopRepository } from "../../../workshops/repositories/workshop.repository.interface";
import { WorkshopEmailTemplates } from "../../../workshops/services/email/workshop-email.templates";
import { logger } from "../../../common/logger";

export interface IWorkshopRequestNotificationService {
  notifyMentorOfNewRequest(
    workshopRequest: any,
    userId: string,
    title: string
  ): Promise<void>;

  notifyAndEmailAcceptance(
    requestId: string,
    workshopId: string,
    requestTitle: string,
    userId: string
  ): Promise<void>;

  notifyAndEmailRejection(
    requestId: string,
    requestTitle: string,
    userId: string
  ): Promise<void>;

  notifyCancellation(
    requestId: string,
    requestTitle: string,
    userId: string,
    isApprentice: boolean
  ): Promise<void>;

  notifyMentorOfUpdate(
    requestId: string,
    request: any,
    input: any,
    userId: string
  ): Promise<void>;
}

export class WorkshopRequestNotificationService
  implements IWorkshopRequestNotificationService
{
  constructor(
    private readonly workshopRequestRepository: IWorkshopRequestRepository,
    private readonly workshopRepository: IWorkshopRepository,
    private readonly notificationService?: INotificationService,
    private readonly emailService?: IEmailService
  ) {}

  async notifyMentorOfNewRequest(
    workshopRequest: any,
    userId: string,
    title: string
  ): Promise<void> {
    if (!this.notificationService) return;

    const requestWithRelations = workshopRequest.mentor?.user?.id
      ? workshopRequest
      : await this.workshopRequestRepository.findById(workshopRequest.id);

    if (!requestWithRelations?.mentor?.user?.id) return;

    const apprenticeName =
      requestWithRelations.apprentice?.user?.name || "un apprenti";

    await this.notificationService.createNotification(
      requestWithRelations.mentor.user.id,
      {
        type: "workshop",
        title: "Nouvelle demande d'atelier",
        message: `${apprenticeName} vous a envoyé une demande pour l'atelier "${title}".`,
        actionUrl: `/dashboard/workshop-requests`,
      },
      userId
    );
  }

  async notifyAndEmailAcceptance(
    requestId: string,
    workshopId: string,
    requestTitle: string,
    userId: string
  ): Promise<void> {
    await Promise.all([
      this.notifyApprenticeOfAcceptance(requestId, workshopId, requestTitle, userId),
      this.sendAcceptanceEmail(requestId, workshopId, requestTitle),
    ]);
  }

  async notifyAndEmailRejection(
    requestId: string,
    requestTitle: string,
    userId: string
  ): Promise<void> {
    await Promise.all([
      this.notifyApprenticeOfRejection(requestId, requestTitle, userId),
      this.sendRejectionEmail(requestId, requestTitle),
    ]);
  }

  async notifyCancellation(
    requestId: string,
    requestTitle: string,
    userId: string,
    isApprentice: boolean
  ): Promise<void> {
    if (!this.notificationService) return;

    const requestWithRelations =
      await this.workshopRequestRepository.findById(requestId);

    if (isApprentice && requestWithRelations?.mentor?.user?.id) {
      const apprenticeName =
        requestWithRelations.apprentice?.user?.name || "un apprenti";
      await this.notificationService.createNotification(
        requestWithRelations.mentor.user.id,
        {
          type: "workshop",
          title: "Demande d'atelier annulée",
          message: `${apprenticeName} a annulé sa demande pour l'atelier "${requestTitle}".`,
          actionUrl: `/dashboard/workshop-requests`,
        },
        userId
      );
    } else if (!isApprentice && requestWithRelations?.apprentice?.user?.id) {
      const mentorName =
        requestWithRelations.mentor?.user?.name || "le mentor";
      await this.notificationService.createNotification(
        requestWithRelations.apprentice.user.id,
        {
          type: "workshop",
          title: "Demande d'atelier annulée",
          message: `${mentorName} a annulé votre demande pour l'atelier "${requestTitle}".`,
          actionUrl: `/workshop-room`,
        },
        userId
      );
    }
  }

  async notifyMentorOfUpdate(
    requestId: string,
    request: any,
    input: any,
    userId: string
  ): Promise<void> {
    if (!this.notificationService) return;

    const requestWithRelations =
      await this.workshopRequestRepository.findById(requestId);

    if (!requestWithRelations?.mentor?.user?.id) return;

    const apprenticeName =
      requestWithRelations.apprentice?.user?.name || "un apprenti";

    const changes: string[] = [];
    if (input.title !== undefined) changes.push("le titre");
    if (input.description !== undefined) changes.push("la description");
    if (input.message !== undefined) changes.push("le message");
    if (input.preferredDate !== undefined) changes.push("la date préférée");
    if (input.preferredTime !== undefined) changes.push("l'heure préférée");
    if (input.mentorId && input.mentorId !== request.mentorId)
      changes.push("le mentor");

    const changesText =
      changes.length > 0
        ? ` a modifié ${changes.join(", ")}`
        : " a mis à jour";

    await this.notificationService.createNotification(
      requestWithRelations.mentor.user.id,
      {
        type: "workshop",
        title: "Demande d'atelier modifiée",
        message: `${apprenticeName}${changesText} de sa demande pour l'atelier "${requestWithRelations.title || request.title}".`,
        actionUrl: `/dashboard/workshop-requests`,
      },
      userId
    );
  }

  private async notifyApprenticeOfAcceptance(
    requestId: string,
    workshopId: string,
    requestTitle: string,
    userId: string
  ): Promise<void> {
    if (!this.notificationService) {
      logger.warn("Notification service not available", { requestId });
      return;
    }

    const requestWithRelations =
      await this.workshopRequestRepository.findById(requestId);

    if (!requestWithRelations?.apprentice?.user?.id) {
      logger.warn("Cannot create notification: apprentice user not found", {
        requestId,
      });
      return;
    }

    const workshopDetails = await this.workshopRepository.findById(workshopId);
    const mentorName = requestWithRelations.mentor?.user?.name || "le mentor";
    const workshopTitle = workshopDetails?.title || requestTitle;

    const notificationResult =
      await this.notificationService.createNotification(
        requestWithRelations.apprentice.user.id,
        {
          type: "workshop",
          title: "Demande d'atelier acceptée",
          message: `${mentorName} a accepté votre demande pour l'atelier "${workshopTitle}".`,
          actionUrl: `/workshop/${workshopId}`,
        },
        userId
      );

    if (!notificationResult.ok) {
      logger.error("Failed to create notification", notificationResult.error, {
        workshopId,
      });
    }
  }

  private async sendAcceptanceEmail(
    requestId: string,
    workshopId: string,
    requestTitle: string
  ): Promise<void> {
    if (!this.emailService) return;

    try {
      const requestWithRelations =
        await this.workshopRequestRepository.findById(requestId);

      if (!requestWithRelations?.apprentice?.user?.id) return;

      const { container } = await import("../../../di/container");
      const apprenticeUser = await container.prisma.user.findUnique({
        where: { id: requestWithRelations.apprentice.user.id },
        select: { email: true, name: true },
      });

      if (!apprenticeUser?.email) return;

      const workshopDetails =
        await this.workshopRepository.findById(workshopId);
      const mentorName =
        requestWithRelations.mentor?.user?.name || "le mentor";

      const template = WorkshopEmailTemplates.requestAccepted({
        recipientName: apprenticeUser.name || "Apprenti",
        mentorName,
        workshopTitle: workshopDetails?.title || requestTitle,
        workshopDate: workshopDetails?.date || null,
        workshopTime: workshopDetails?.time || null,
        workshopDuration: workshopDetails?.duration || null,
        workshopLocation: workshopDetails?.location || null,
        isVirtual: workshopDetails?.isVirtual || false,
        workshopId,
      });

      const emailResult = await this.emailService.sendEmail({
        to: apprenticeUser.email,
        ...template,
      });

      if (!emailResult.ok) {
        logger.error("Failed to send acceptance email", {
          workshopId,
          error: emailResult.error,
        });
      }
    } catch (error) {
      logger.error("Error sending acceptance email", { requestId, error });
    }
  }

  private async notifyApprenticeOfRejection(
    requestId: string,
    requestTitle: string,
    userId: string
  ): Promise<void> {
    if (!this.notificationService) return;

    const requestWithRelations =
      await this.workshopRequestRepository.findById(requestId);

    if (!requestWithRelations?.apprentice?.user?.id) return;

    const mentorName = requestWithRelations.mentor?.user?.name || "le mentor";
    await this.notificationService.createNotification(
      requestWithRelations.apprentice.user.id,
      {
        type: "workshop",
        title: "Demande d'atelier rejetée",
        message: `${mentorName} a rejeté votre demande pour l'atelier "${requestTitle}".`,
        actionUrl: `/workshop-room`,
      },
      userId
    );
  }

  private async sendRejectionEmail(
    requestId: string,
    requestTitle: string
  ): Promise<void> {
    if (!this.emailService) return;

    try {
      const requestWithRelations =
        await this.workshopRequestRepository.findById(requestId);

      if (!requestWithRelations?.apprentice?.user?.id) return;

      const { container } = await import("../../../di/container");
      const apprenticeUser = await container.prisma.user.findUnique({
        where: { id: requestWithRelations.apprentice.user.id },
        select: { email: true, name: true },
      });

      if (!apprenticeUser?.email) return;

      const mentorName =
        requestWithRelations.mentor?.user?.name || "le mentor";

      const template = WorkshopEmailTemplates.requestRejected({
        recipientName: apprenticeUser.name || "Apprenti",
        mentorName,
        workshopTitle: requestTitle,
      });

      const emailResult = await this.emailService.sendEmail({
        to: apprenticeUser.email,
        ...template,
      });

      if (!emailResult.ok) {
        logger.error("Failed to send rejection email", {
          requestId,
          error: emailResult.error,
        });
      }
    } catch (error) {
      logger.error("Error sending rejection email", { requestId, error });
    }
  }
}
