import { PrismaClient } from "../../../../prisma/generated/client/client";
import { AdminStats, IAdminService } from "./admin.service.interface";

export class AdminService implements IAdminService {
  constructor(private readonly prisma: PrismaClient) {}

  async getStats(): Promise<AdminStats> {
    const [reports, moderation, support, onboarding] = await Promise.all([
      (this.prisma as any).user_report.count({ where: { status: "PENDING" } }),
      (this.prisma as any).mentor_feedback.count({ where: { status: "UNDER_REVIEW" } }),
      (this.prisma as any).support_request.count({ where: { status: "PENDING" } }),
      (this.prisma as any).app_user.count({ where: { status: "PENDING" } }),
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

    return (this.prisma as any).app_user.findMany({
      where: { status: "PENDING" },
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
      },
    });
  }
}
