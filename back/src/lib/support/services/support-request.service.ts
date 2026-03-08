import { type support_request } from '@/lib/prisma';
import { SupportRequestStatus } from "../types/support-types";
import {
  CreateSupportRequestCommand,
  ISupportRequestService,
} from "./support-request.service.interface";
import { ISupportRequestRepository } from "../repositories/support-request.repository.interface";
import { INotificationService } from "../../notifications/services/notification.service.interface";
import { IEmailService } from "../../email/services/email.service.interface";
import { renderEmailTemplate } from "../../email/utils/render-email";
import { SupportRequestConfirmation } from "../../email/templates/SupportRequestConfirmation";
import * as React from "react";
import { logger } from "../../common/logger";

export class SupportRequestService implements ISupportRequestService {
  constructor(
    private readonly supportRequestRepository: ISupportRequestRepository,
    private readonly notificationService: INotificationService,
    private readonly emailService?: IEmailService
  ) {}

  async createSupportRequest(command: CreateSupportRequestCommand): Promise<support_request> {
    const request = await this.supportRequestRepository.create({
      userId: command.userId,
      email: command.email,
      subject: command.subject,
      description: command.description,
      problemType: command.problemType,
      attachments: command.attachments,
      status: SupportRequestStatus.PENDING,
    });

    // Notify admins
    await this.notificationService.notifyAdmin(
      "NEW_SUPPORT_REQUEST",
      `Nouvelle demande de support : ${command.subject}`,
      `/admin/support?requestId=${request.id}`
    );

    // Send confirmation email
    if (this.emailService && command.email) {
      try {
        const attachments = command.attachments as any[];
        const { html, text } = await renderEmailTemplate(
          React.createElement(SupportRequestConfirmation, {
            subject: command.subject,
            problemType: command.problemType,
            requestId: request.id,
            hasAttachments: !!(attachments && attachments.length > 0),
            attachmentCount: attachments?.length || 0,
          })
        );

        await this.emailService.sendEmail({
          to: command.email,
          subject: `Confirmation de votre demande de support : ${command.subject}`,
          html,
          text,
        });
      } catch (error) {
        logger.error("Failed to send support request confirmation email", { error, requestId: request.id });
      }
    }

    return request;
  }

  async getAdminSupportQueue(params?: {
    limit?: number;
    offset?: number;
    status?: string;
  }): Promise<any[]> {
    const where: any = {};
    if (params?.status) {
      where.status = params.status;
    }

    return this.supportRequestRepository.findMany({
      take: params?.limit ?? 50,
      skip: params?.offset ?? 0,
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            photoUrl: true,
            displayName: true,
          }
        }
      }
    });
  }

  async updateSupportRequestStatus(
    requestId: string,
    status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
  ): Promise<support_request> {
    return this.supportRequestRepository.update(requestId, { status });
  }

  async getSupportRequestById(requestId: string): Promise<any | null> {
    return this.supportRequestRepository.findMany({
      where: { id: requestId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            photoUrl: true,
            displayName: true,
          }
        }
      }
    }).then(results => results[0] || null);
  }
}
