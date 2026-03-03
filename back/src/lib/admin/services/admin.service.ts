import { PrismaClient } from "../../../../prisma/generated/client/client";
import { AdminStats, IAdminService } from "./admin.service.interface";

export class AdminService implements IAdminService {
  constructor(private readonly prisma: PrismaClient) {}

  async getStats(): Promise<AdminStats> {
    const [reports, moderation, support, onboarding] = await Promise.all([
      this.prisma.user_report.count({ where: { status: "PENDING" } }),
      (this.prisma as any).mentor_feedback.count({ where: { status: "UNDER_REVIEW" } }),
      (this.prisma as any).support_request.count({ where: { status: "PENDING" } }),
      this.prisma.user.count({ where: { status: "PENDING" } }),
    ]);

    return {
      reports,
      moderation,
      support,
      onboarding,
    };
  }

  async getOnboardingQueue(params?: { limit?: number; offset?: number }): Promise<any> {
    const limit = params?.limit ?? 50;
    const offset = params?.offset ?? 0;

    return this.prisma.user.findMany({
      where: { status: "PENDING" },
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });
  }

  async approveUser(appUserId: string): Promise<any> {
    return this.prisma.user.update({
      where: { id: appUserId },
      data: { status: "ACTIVE" },
    });
  }

  async rejectUser(appUserId: string, reason?: string): Promise<any> {
    return this.prisma.user.update({
      where: { id: appUserId },
      data: { status: "SUSPENDED", deletionReason: reason },
    });
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
        { action: { contains: searchTerm, mode: 'insensitive' } },
        { targetId: { contains: searchTerm, mode: 'insensitive' } },
        { admin: { name: { contains: searchTerm, mode: 'insensitive' } } },
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
            select: { name: true, id: true }
          }
        }
      }),
      this.prisma.audit_log.count({ where }),
    ]);

    return { 
      logs: logs.map(log => ({
        ...log,
        adminName: log.admin.name,
        adminId: log.admin.id,
      })), 
      total 
    };
  }
}
