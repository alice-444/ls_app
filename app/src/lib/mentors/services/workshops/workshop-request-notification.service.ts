import type { INotificationService } from "../../../notifications/services/notification.service.interface";
import type { IEmailService } from "../../../email/services/email.service.interface";
import type { IWorkshopRequestRepository } from "../../repositories/workshop-request.repository.interface";
import type { IWorkshopRepository } from "../../../workshops/repositories/workshop.repository.interface";
import { renderEmailTemplate } from "../../../email/utils/render-email";
import { WorkshopRequestAcceptedEmail } from "../../../email/templates/WorkshopRequestAccepted";
import { WorkshopRequestRejectedEmail } from "../../../email/templates/WorkshopRequestRejected";
import { WorkshopRequestReceivedEmail } from "../../../email/templates/WorkshopRequestReceivedEmail";
import * as React from "react";
import { logger } from "../../../common/logger";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

export interface IWorkshopRequestNotificationService {
  notifyMentorOfNewRequest(
    workshopRequest: any,
    userId: string,
    title: string,
  ): Promise<void>;

  notifyAndEmailAcceptance(
    requestId: string,
    workshopId: string,
    requestTitle: string,
    userId: string,
  ): Promise<void>;

  notifyAndEmailRejection(
    requestId: string,
    requestTitle: string,
    userId: string,
    reason?: string | null,
  ): Promise<void>;

  notifyCancellation(
    requestId: string,
    requestTitle: string,
    userId: string,
    isApprentice: boolean,
  ): Promise<void>;

  notifyMentorOfUpdate(
    requestId: string,
    request: any,
    input: any,
    userId: string,
  ): Promise<void>;
}

export class WorkshopRequestNotificationService implements IWorkshopRequestNotificationService {
  constructor(
    private readonly workshopRequestRepository: IWorkshopRequestRepository,
    private readonly workshopRepository: IWorkshopRepository,
    private readonly notificationService?: INotificationService,
    private readonly emailService?: IEmailService,
  ) {}

  async notifyMentorOfNewRequest(
    workshopRequest: any,
    userId: string,
    title: string,
  ): Promise<void> {
    await Promise.all([
      this.notifyMentorOfNewRequestInternal(workshopRequest, userId, title),
      this.sendNewRequestEmail(workshopRequest.id, title),
    ]);
  }

  private async notifyMentorOfNewRequestInternal(
    workshopRequest: any,
    userId: string,
    title: string,
  ): Promise<void> {
    if (!this.notificationService) return;

    const requestWithRelations = workshopRequest.mentor?.id
      ? workshopRequest
      : await this.workshopRequestRepository.findById(workshopRequest.id);

    if (!requestWithRelations?.mentor?.id) return;

    const apprenticeName =
      requestWithRelations.apprentice?.name || "un apprenti";

    await this.notificationService.createNotification(
      requestWithRelations.mentor.id,
      {
        type: "workshop",
        title: "Nouvelle demande d'atelier",
        message: `${apprenticeName} vous a envoyé une demande pour l'atelier "${title}".`,
        actionUrl: `/dashboard/workshop-requests`,
      },
      userId,
    );
  }

  private async sendNewRequestEmail(
    requestId: string,
    workshopTitle: string,
  ): Promise<void> {
    if (!this.emailService) return;

    try {
      const requestWithRelations =
        await this.workshopRequestRepository.findById(requestId);

      const mentor = requestWithRelations?.mentor;
      if (!mentor?.email || !requestWithRelations) return;

      const mentorName = mentor.name || "Mentor";
      const apprenticeName =
        requestWithRelations.apprentice?.name || "un apprenti";

      const { html, text } = await renderEmailTemplate(
        React.createElement(WorkshopRequestReceivedEmail, {
          mentorName,
          apprenticeName,
          workshopTitle,
          viewRequestUrl: `${APP_URL}/dashboard/workshop-requests`,
        }),
      );

      const emailResult = await this.emailService.sendEmail({
        to: mentor.email,
        subject: `Nouvelle demande de participation - ${workshopTitle}`,
        html,
        text,
      });

      if (!emailResult.ok) {
        logger.error("Failed to send new request email", {
          requestId,
          error: emailResult.error,
        });
      }
    } catch (error) {
      logger.error("Error sending new request email", { requestId, error });
    }
  }

  async notifyAndEmailAcceptance(
    requestId: string,
    workshopId: string,
    requestTitle: string,
    userId: string,
  ): Promise<void> {
    await Promise.all([
      this.notifyApprenticeOfAcceptance(
        requestId,
        workshopId,
        requestTitle,
        userId,
      ),
      this.sendAcceptanceEmail(requestId, workshopId, requestTitle),
    ]);
  }

  async notifyAndEmailRejection(
    requestId: string,
    requestTitle: string,
    userId: string,
    reason?: string | null,
  ): Promise<void> {
    await Promise.all([
      this.notifyApprenticeOfRejection(requestId, requestTitle, userId, reason),
      this.sendRejectionEmail(requestId, requestTitle, reason),
    ]);
  }

  async notifyCancellation(
    requestId: string,
    requestTitle: string,
    userId: string,
    isApprentice: boolean,
  ): Promise<void> {
    if (!this.notificationService) return;

    const requestWithRelations =
      await this.workshopRequestRepository.findById(requestId);

    if (isApprentice && requestWithRelations?.mentor?.id) {
      const apprenticeName =
        requestWithRelations.apprentice?.name || "un apprenti";
      await this.notificationService.createNotification(
        requestWithRelations.mentor.id,
        {
          type: "workshop",
          title: "Demande d'atelier annulée",
          message: `${apprenticeName} a annulé sa demande pour l'atelier "${requestTitle}".`,
          actionUrl: `/dashboard/workshop-requests`,
        },
        userId,
      );
    } else if (!isApprentice && requestWithRelations?.apprentice?.id) {
      const mentorName = requestWithRelations.mentor?.name || "le mentor";
      await this.notificationService.createNotification(
        requestWithRelations.apprentice.id,
        {
          type: "workshop",
          title: "Demande d'atelier annulée",
          message: `${mentorName} a annulé votre demande pour l'atelier "${requestTitle}".`,
          actionUrl: `/catalog`,
        },
        userId,
      );
    }
  }

  async notifyMentorOfUpdate(
    requestId: string,
    request: any,
    input: any,
    userId: string,
  ): Promise<void> {
    if (!this.notificationService) return;

    const requestWithRelations =
      await this.workshopRequestRepository.findById(requestId);

    if (!requestWithRelations?.mentor?.id) return;

    const apprenticeName =
      requestWithRelations.apprentice?.name || "un apprenti";

    const changes: string[] = [];
    if (input.title !== undefined) changes.push("le titre");
    if (input.description !== undefined) changes.push("la description");
    if (input.message !== undefined) changes.push("le message");
    if (input.preferredDate !== undefined) changes.push("la date préférée");
    if (input.preferredTime !== undefined) changes.push("l'heure préférée");
    if (input.mentorId && input.mentorId !== request.mentorId)
      changes.push("le mentor");

    const changesText =
      changes.length > 0 ? ` a modifié ${changes.join(", ")}` : " a mis à jour";

    await this.notificationService.createNotification(
      requestWithRelations.mentor.id,
      {
        type: "workshop",
        title: "Demande d'atelier modifiée",
        message: `${apprenticeName}${changesText} de sa demande pour l'atelier "${requestWithRelations.title || request.title}".`,
        actionUrl: `/dashboard/workshop-requests`,
      },
      userId,
    );
  }

  private async notifyApprenticeOfAcceptance(
    requestId: string,
    workshopId: string,
    requestTitle: string,
    userId: string,
  ): Promise<void> {
    if (!this.notificationService) {
      logger.warn("Notification service not available", { requestId });
      return;
    }

    const requestWithRelations =
      await this.workshopRequestRepository.findById(requestId);

    if (!requestWithRelations?.apprentice?.id) {
      logger.warn("Cannot create notification: apprentice user not found", {
        requestId,
      });
      return;
    }

    const workshopDetails = await this.workshopRepository.findById(workshopId);
    const mentorName = requestWithRelations.mentor?.name || "le mentor";
    const workshopTitle = workshopDetails?.title || requestTitle;

    const notificationResult =
      await this.notificationService.createNotification(
        requestWithRelations.apprentice.id,
        {
          type: "workshop",
          title: "Demande d'atelier acceptée",
          message: `${mentorName} a accepté votre demande pour l'atelier "${workshopTitle}".`,
          actionUrl: `/workshop/${workshopId}`,
        },
        userId,
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
    requestTitle: string,
  ): Promise<void> {
    if (!this.emailService) return;

    try {
      const requestWithRelations =
        await this.workshopRequestRepository.findById(requestId);

      const apprentice = requestWithRelations?.apprentice;
      if (!apprentice?.email || !requestWithRelations) return;

      const workshopDetails =
        await this.workshopRepository.findById(workshopId);
      const mentorName = requestWithRelations.mentor?.name || "le mentor";

      const formattedDate = workshopDetails?.date
        ? new Date(workshopDetails.date).toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })
        : "Date à confirmer";

      const { html, text } = await renderEmailTemplate(
        React.createElement(WorkshopRequestAcceptedEmail, {
          userName: apprentice.name || "Apprenti",
          mentorName,
          workshopTitle: workshopDetails?.title || requestTitle,
          date: formattedDate,
          time: workshopDetails?.time || "Heure à confirmer",
          workshopUrl: `${APP_URL}/workshop/${workshopId}`,
        }),
      );

      const emailResult = await this.emailService.sendEmail({
        to: apprentice.email,
        subject: `Demande acceptée - ${workshopDetails?.title || requestTitle}`,
        html,
        text,
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
    userId: string,
    reason?: string | null,
  ): Promise<void> {
    if (!this.notificationService) return;

    const requestWithRelations =
      await this.workshopRequestRepository.findById(requestId);

    if (!requestWithRelations?.apprentice?.id) return;

    const mentorName = requestWithRelations.mentor?.name || "le mentor";
    const message = reason
      ? `${mentorName} a rejeté votre demande pour l'atelier "${requestTitle}". Motif : ${reason}`
      : `${mentorName} a rejeté votre demande pour l'atelier "${requestTitle}".`;

    await this.notificationService.createNotification(
      requestWithRelations.apprentice.id,
      {
        type: "workshop",
        title: "Demande d'atelier rejetée",
        message,
        actionUrl: `/catalog`,
      },
      userId,
    );
  }

  private async sendRejectionEmail(
    requestId: string,
    requestTitle: string,
    reason?: string | null,
  ): Promise<void> {
    if (!this.emailService) return;

    try {
      const requestWithRelations =
        await this.workshopRequestRepository.findById(requestId);

      const apprentice = requestWithRelations?.apprentice;
      if (!apprentice?.email || !requestWithRelations) return;

      const mentorName = requestWithRelations.mentor?.name || "le mentor";

      const { html, text } = await renderEmailTemplate(
        React.createElement(WorkshopRequestRejectedEmail, {
          userName: apprentice.name || "Apprenti",
          mentorName,
          workshopTitle: requestTitle,
          reason,
          workshopsUrl: `${APP_URL}/catalog`,
        }),
      );

      const emailResult = await this.emailService.sendEmail({
        to: apprentice.email,
        subject: `Mise à jour concernant votre demande - ${requestTitle}`,
        html,
        text,
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
