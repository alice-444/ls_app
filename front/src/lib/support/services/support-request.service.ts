import type { support_request, PrismaClient } from "@/lib/prisma-server";
import { SupportRequestDetailed, SupportMessage } from "@ls-app/shared";
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
import { IAuditLogService } from "../../common/audit-log.service";

export class SupportRequestService implements ISupportRequestService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly supportRequestRepository: ISupportRequestRepository,
    private readonly notificationService: INotificationService,
    private readonly emailService?: IEmailService,
    private readonly auditLogService?: IAuditLogService,
  ) {}

  async createSupportRequest(
    command: CreateSupportRequestCommand,
  ): Promise<support_request> {
    const request = await this.supportRequestRepository.create({
      userId: command.userId,
      email: command.email,
      subject: command.subject,
      description: command.description,
      problemType: command.problemType,
      attachments: command.attachments,
      status: SupportRequestStatus.PENDING,
    });

    // Add initial message to the thread
    await this.addMessage({
      requestId: request.id,
      content: command.description,
      senderId: command.userId,
      isAdmin: false,
    });

    // Notify admins
    await this.notificationService.notifyAdmin(
      "NEW_SUPPORT_REQUEST",
      `Nouvelle demande de support : ${command.subject}`,
      `/admin/support?requestId=${request.id}`,
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
          }),
        );

        await this.emailService.sendEmail({
          to: command.email,
          subject: `Confirmation de votre demande de support : ${command.subject}`,
          html,
          text,
        });
      } catch (error) {
        logger.error("Failed to send support request confirmation email", {
          error,
          requestId: request.id,
        });
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
          },
        },
      },
    });
  }

  async updateSupportRequestStatus(
    requestId: string,
    status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "CLOSED",
    adminId?: string,
  ): Promise<support_request> {
    const request = await this.supportRequestRepository.update(requestId, { status });

    if (adminId && this.auditLogService) {
      await this.auditLogService.record({
        adminId,
        action: "UPDATE_SUPPORT_STATUS",
        targetId: request.userId || undefined,
        details: { requestId, status, subject: request.subject },
      });
    }

    return request;
  }

  async getSupportRequestById(
    requestId: string,
  ): Promise<support_request | null> {
    return this.supportRequestRepository
      .findMany({
        where: { id: requestId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              photoUrl: true,
              displayName: true,
            },
          },
        },
      })
      .then((results) => results[0] || null);
  }

  async getMyRequests(userId: string): Promise<support_request[]> {
    return this.supportRequestRepository.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async getSupportRequestDetailed(requestId: string): Promise<SupportRequestDetailed | null> {
    const request = await this.prisma.support_request.findUnique({
      where: { id: requestId },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        messages: {
          include: {
            sender: {
              select: { id: true, name: true, image: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!request) return null;

    return {
      ...request,
      status: request.status as any,
      messages: request.messages.map((m) => ({
        ...m,
        isAdmin: m.isAdmin
      }))
    };
  }

  async addMessage(params: {
    requestId: string;
    content: string;
    senderId?: string;
    isAdmin?: boolean;
  }): Promise<SupportMessage> {
    const message = await this.prisma.support_message.create({
      data: {
        requestId: params.requestId,
        content: params.content,
        senderId: params.senderId,
        isAdmin: params.isAdmin ?? false,
      },
      include: {
        sender: {
          select: { id: true, name: true, image: true }
        }
      }
    });

    const request = await this.getSupportRequestById(params.requestId);

    // Notify user if admin replied
    if (params.isAdmin) {
      if (request?.userId) {
        await this.notificationService.createNotification(request.userId, {
          type: "SUPPORT_REPLY",
          title: "Nouvelle réponse du support",
          message: `L'administration a répondu à votre demande : ${request.subject}`,
          actionUrl: `/help/support/${request.id}`,
        }, params.senderId);
      }

      if (params.senderId && this.auditLogService) {
        await this.auditLogService.record({
          adminId: params.senderId,
          action: "SUPPORT_ADMIN_REPLY",
          targetId: request?.userId || undefined,
          details: { requestId: params.requestId, messageId: message.id },
        });
      }
    }

    return message as any;
  }
}
