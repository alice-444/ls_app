import { PrismaClient } from "@/lib/prisma";
import { AdminStats } from "@ls-app/shared";
import { IAdminService } from "./admin.service.interface";
import type { IEmailService } from "../../email/services/email.service.interface";
import { renderEmailTemplate } from "../../email/utils/render-email";
import { MentorProfileStatusEmail } from "../../email/templates/MentorProfileStatusEmail";
import * as React from "react";
import { logger } from "../../common/logger";
import { IAuditLogService } from "../../common/audit-log.service";
import { generateInternalId } from "../../utils/id-generator";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

export class AdminService implements IAdminService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly auditLogService: IAuditLogService,
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

  async approveUser(userId: string, adminId?: string): Promise<any> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { status: "ACTIVE" },
    });

    if (adminId) {
      await this.auditLogService.record({
        adminId,
        action: "APPROVE_USER",
        targetId: userId,
        details: { userEmail: user.email, userName: user.name },
      });
    }

    await this.sendProfileStatusEmail(user, true);
    return user;
  }

  async rejectUser(userId: string, adminId?: string, reason?: string): Promise<any> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { status: "SUSPENDED", deletionReason: reason },
    });

    if (adminId) {
      await this.auditLogService.record({
        adminId,
        action: "REJECT_USER",
        targetId: userId,
        details: { userEmail: user.email, userName: user.name, reason },
      });
    }

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

  async getUser360(userId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        workshops_as_mentor: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
        workshops_as_apprentice: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
        creditTransactions: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
        supportRequests: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
        reports_received: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            reporter: { select: { name: true, email: true } }
          }
        },
        reports_made: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
        notifications: {
          take: 10,
          orderBy: { createdAt: "desc" },
        }
      },
    });

    if (!user) return null;

    // Get audit logs where this user was the TARGET
    const auditLogs = await this.prisma.audit_log.findMany({
      where: { targetId: userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        admin: { select: { name: true } }
      }
    });

    return {
      ...user,
      auditLogs,
    };
  }

  async updateUserCredits(params: {
    adminId: string;
    userId: string;
    amount: number;
    reason: string;
    type: "ADD" | "REMOVE";
  }): Promise<any> {
    const { adminId, userId, amount, reason, type } = params;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new Error("Utilisateur non trouvé");

    const newBalance = type === "ADD" 
      ? user.creditBalance + amount 
      : Math.max(0, user.creditBalance - amount);

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { creditBalance: newBalance },
    });

    // Record in credit_transaction table
    await this.prisma.credit_transaction.create({
      data: {
        id: generateInternalId(),
        userId: user.id,
        amount: type === "ADD" ? amount : -amount,
        description: `Admin Adjustment: ${reason}`,
        type: type === "ADD" ? "TOP_UP" : "USAGE",
      },
    });

    // Record in audit_log table
    await this.auditLogService.record({
      adminId,
      action: type === "ADD" ? "ADD_CREDITS" : "REMOVE_CREDITS",
      targetId: userId,
      details: { amount, reason, previousBalance: user.creditBalance, newBalance },
    });

    return updatedUser;
  }

  async bulkApproveUsers(userIds: string[], adminId: string): Promise<any> {
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
    });

    const result = await this.prisma.user.updateMany({
      where: { id: { in: userIds } },
      data: { status: "ACTIVE" },
    });

    // Audit logs for each user
    await Promise.all(users.map(user => 
      this.auditLogService.record({
        adminId,
        action: "BULK_APPROVE_USER",
        targetId: user.id,
        details: { userEmail: user.email, userName: user.name },
      })
    ));

    // Send emails (non-blocking for the transaction but we want to notify all)
    users.forEach(user => this.sendProfileStatusEmail(user, true));

    return result;
  }

  async bulkRejectUsers(userIds: string[], adminId: string, reason?: string): Promise<any> {
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
    });

    const result = await this.prisma.user.updateMany({
      where: { id: { in: userIds } },
      data: { status: "SUSPENDED", deletionReason: reason },
    });

    // Audit logs for each user
    await Promise.all(users.map(user => 
      this.auditLogService.record({
        adminId,
        action: "BULK_REJECT_USER",
        targetId: user.id,
        details: { userEmail: user.email, userName: user.name, reason },
      })
    ));

    // Send emails
    users.forEach(user => this.sendProfileStatusEmail(user, false, reason));

    return result;
  }
}
