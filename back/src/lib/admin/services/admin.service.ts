import { PrismaClient } from "@/lib/prisma";
import { AdminStats, IAdminService } from "./admin.service.interface";
import type { IEmailService } from "../../email/services/email.service.interface";
import { renderEmailTemplate } from "../../email/utils/render-email";
import { MentorProfileStatusEmail } from "../../email/templates/MentorProfileStatusEmail";
import * as React from "react";
import { logger } from "../../common/logger";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

export class AdminService implements IAdminService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly emailService?: IEmailService,
  ) {}

  async getStats(): Promise<AdminStats> {
    const [reports, moderation, support, onboarding] = await Promise.all([
      this.prisma.user_report.count({ where: { status: "PENDING" } }),
      (this.prisma as any).mentor_feedback.count({
        where: { status: "UNDER_REVIEW" },
      }),
      (this.prisma as any).support_request.count({
        where: { status: "PENDING" },
      }),
      this.prisma.user.count({ where: { status: "PENDING" } }),
    ]);

    return {
      reports,
      moderation,
      support,
      onboarding,
    };
  }

  async getOnboardingQueue(params?: {
    limit?: number;
    offset?: number;
  }): Promise<any> {
    const limit = params?.limit ?? 50;
    const offset = params?.offset ?? 0;

    return this.prisma.user.findMany({
      where: { status: "PENDING" },
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });
  }

  async approveUser(userId: string): Promise<any> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { status: "ACTIVE" },
    });

    await this.sendProfileStatusEmail(user, true);
    return user;
  }

  async rejectUser(userId: string, reason?: string): Promise<any> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { status: "SUSPENDED", deletionReason: reason },
    });

    await this.sendProfileStatusEmail(user, false, reason);
    return user;
  }

  private async sendProfileStatusEmail(
    user: any,
    isApproved: boolean,
    reason?: string,
  ): Promise<void> {
    if (!this.emailService || !user.email) return;

    try {
      const { html, text } = await renderEmailTemplate(
        React.createElement(MentorProfileStatusEmail, {
          userName: user.displayName || user.name || "Mentor",
          isApproved,
          reason,
          actionUrl: isApproved
            ? `${APP_URL}/dashboard`
            : `${APP_URL}/onboarding`,
        }),
      );

      const subject = isApproved
        ? "Félicitations ! Votre profil mentor LearnSup est validé"
        : "Action requise sur votre profil mentor LearnSup";

      const emailResult = await this.emailService.sendEmail({
        to: user.email,
        subject,
        html,
        text,
      });

      if (!emailResult.ok) {
        logger.error("Failed to send profile status email", {
          userId: user.id,
          error: emailResult.error,
        });
      }
    } catch (error) {
      logger.error("Error sending profile status email", {
        userId: user.id,
        error,
      });
    }
  }

  async getAuditLogs(params: {
    limit: number;
    offset: number;
    searchTerm?: string;
  }): Promise<{ logs: any[]; total: number }> {
    const { limit, offset, searchTerm } = params;
    const where: any = {};

    if (searchTerm) {
      where.OR = [
        { action: { contains: searchTerm, mode: "insensitive" } },
        { targetId: { contains: searchTerm, mode: "insensitive" } },
        { admin: { name: { contains: searchTerm, mode: "insensitive" } } },
      ];
    }

    const [logs, total] = await this.prisma.$transaction([
      this.prisma.audit_log.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
        include: {
          admin: {
            select: { name: true, id: true },
          },
        },
      }),
      this.prisma.audit_log.count({ where }),
    ]);

    return {
      logs: logs.map((log) => ({
        ...log,
        adminName: log.admin.name,
        adminId: log.admin.id,
      })),
      total,
    };
  }
}
