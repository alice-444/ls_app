import { PrismaClient } from "@/lib/prisma-server";
import {
  AdminBIStats,
  AdminTimeRange,
  CreditsStats,
  WorkshopStats,
  ActivityHeatmap,
} from "@ls-app/shared";
import { IAnalyticsService } from "./analytics.service.interface";

export class AnalyticsService implements IAnalyticsService {
  constructor(private readonly prisma: PrismaClient) {}

  async getAnalytics(timeRange: AdminTimeRange = "30d"): Promise<AdminBIStats> {
    const now = new Date();
    let startDate: Date | undefined;

    if (timeRange === "7d")
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    else if (timeRange === "30d")
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    else if (timeRange === "90d")
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const [credits, workshops, activityHeatmap, communityMap] =
      await Promise.all([
        this.getCreditsStats(startDate),
        this.getWorkshopStats(startDate),
        this.getActivityHeatmap(startDate),
        this.getCommunityMap(),
      ]);

    return {
      credits,
      workshops,
      activityHeatmap,
      communityMap,
    };
  }

  private async getCommunityMap(): Promise<any[]> {
    // Supply: Count users with role MENTOR by domain
    const mentorsByDomain = await this.prisma.user.groupBy({
      by: ["domain"],
      _count: { _all: true },
      where: {
        role: "MENTOR",
        status: "ACTIVE",
      },
    });

    // Demand: Count workshop requests by domain (we'll infer domain from the workshop if available)
    // For now, let's use workshops created (all workshops including drafts/cancelled represent a form of demand or proposal)
    const demandByDomain = await this.prisma.workshop.groupBy({
      by: ["domain"],
      _count: { _all: true },
    });

    const domains = new Set([
      ...mentorsByDomain.map((m) => m.domain),
      ...demandByDomain.map((d) => d.domain),
    ]);

    return Array.from(domains)
      .filter(Boolean)
      .map((domain) => {
        const supply =
          mentorsByDomain.find((m) => m.domain === domain)?._count._all || 0;
        const demand =
          demandByDomain.find((d) => d.domain === domain)?._count._all || 0;
        return {
          domain: domain!,
          supply,
          demand,
        };
      });
  }

  private async getCreditsStats(startDate?: Date): Promise<CreditsStats> {
    const [totalBalanceResult, transactions] = await Promise.all([
      this.prisma.user.aggregate({
        _sum: {
          creditBalance: true,
        },
      }),
      this.prisma.credit_transaction.findMany({
        where: startDate ? { createdAt: { gte: startDate } } : {},
        orderBy: { createdAt: "asc" },
      }),
    ]);

    let totalTopUps = 0;
    let totalUsage = 0;
    let totalRefunds = 0;

    const aggregatedTransactions: Record<string, number> = {};

    transactions.forEach((t) => {
      if (t.type === "TOP_UP") totalTopUps += t.amount;
      else if (t.type === "USAGE") totalUsage += Math.abs(t.amount);
      else if (t.type === "REFUND") totalRefunds += t.amount;

      const date = t.createdAt.toISOString().split("T")[0];
      aggregatedTransactions[date] =
        (aggregatedTransactions[date] || 0) + t.amount;
    });

    const transactionsOverTime = Object.entries(aggregatedTransactions)
      .map(([date, amount]) => ({
        date,
        amount,
        type: "BALANCE_CHANGE",
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalBalance: totalBalanceResult._sum.creditBalance || 0,
      totalTopUps,
      totalUsage,
      totalRefunds,
      transactionsOverTime,
    };
  }

  private async getWorkshopStats(startDate?: Date): Promise<WorkshopStats> {
    const where = startDate ? { createdAt: { gte: startDate } } : {};

    const [
      totalWorkshops,
      workshopsByDomain,
      workshopsByTopic,
      workshopsStatus,
      completedWorkshops,
    ] = await Promise.all([
      this.prisma.workshop.count({ where }),
      this.prisma.workshop.groupBy({
        by: ["domain"],
        _count: { _all: true },
        where,
      }),
      this.prisma.workshop.groupBy({
        by: ["topic"],
        _count: { _all: true },
        where,
      }),
      this.prisma.workshop.groupBy({
        by: ["status"],
        _count: { _all: true },
        where,
      }),
      this.prisma.workshop.findMany({
        where: {
          ...where,
          status: "COMPLETED",
        },
        select: {
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    const statusCounts = workshopsStatus.reduce(
      (acc, curr) => {
        acc[curr.status] = curr._count._all;
        return acc;
      },
      {} as Record<string, number>,
    );

    const completed = statusCounts["COMPLETED"] || 0;
    const cancelled = statusCounts["CANCELLED"] || 0;
    const totalFinished = completed + cancelled;

    const completionRate =
      totalFinished > 0 ? (completed / totalFinished) * 100 : 0;
    const cancellationRate =
      totalFinished > 0 ? (cancelled / totalFinished) * 100 : 0;

    // Average completion time in hours
    let averageCompletionTime = 0;
    if (completedWorkshops.length > 0) {
      const totalTime = completedWorkshops.reduce((acc, curr) => {
        const diff = curr.updatedAt.getTime() - curr.createdAt.getTime();
        return acc + diff;
      }, 0);
      averageCompletionTime =
        totalTime / completedWorkshops.length / (1000 * 60 * 60);
    }

    return {
      totalWorkshops,
      workshopsByDomain: workshopsByDomain.map((d) => ({
        domain: d.domain || "Unknown",
        count: d._count._all,
      })),
      workshopsByTopic: workshopsByTopic.map((t) => ({
        topic: t.topic || "Unknown",
        count: t._count._all,
      })),
      workshopsStatusDistribution: workshopsStatus.map((s) => ({
        status: s.status,
        count: s._count._all,
      })),
      completionRate,
      cancellationRate,
      averageCompletionTime,
    };
  }

  private async getActivityHeatmap(
    startDate?: Date,
  ): Promise<ActivityHeatmap[]> {
    const where = startDate ? { createdAt: { gte: startDate } } : {};

    // Get message counts by day and hour
    const messages = await this.prisma.message.findMany({
      where,
      select: { createdAt: true },
    });

    const heatmapMap: Record<string, ActivityHeatmap> = {};

    messages.forEach((m) => {
      const dayOfWeek = m.createdAt.getUTCDay();
      const hour = m.createdAt.getUTCHours();
      const key = `${dayOfWeek}-${hour}-MESSAGE`;

      if (!heatmapMap[key]) {
        heatmapMap[key] = { dayOfWeek, hour, count: 0, type: "MESSAGE" };
      }
      heatmapMap[key].count++;
    });

    // For user lastSeen
    const users = await this.prisma.user.findMany({
      where: startDate
        ? { lastSeen: { gte: startDate } }
        : { lastSeen: { not: null } },
      select: { lastSeen: true },
    });

    users.forEach((u) => {
      if (!u.lastSeen) return;
      const dayOfWeek = u.lastSeen.getUTCDay();
      const hour = u.lastSeen.getUTCHours();
      const key = `${dayOfWeek}-${hour}-LOGIN`;

      if (!heatmapMap[key]) {
        heatmapMap[key] = { dayOfWeek, hour, count: 0, type: "LOGIN" };
      }
      heatmapMap[key].count++;
    });

    return Object.values(heatmapMap);
  }
}
