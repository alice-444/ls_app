import { PrismaClient } from "@/lib/prisma";
import { 
  AdminBIStats, 
  AdminTimeRange,
  CreditsStats,
  WorkshopStats,
  ActivityHeatmap
} from "@ls-app/shared";
import { IAnalyticsService } from "./analytics.service.interface";

export class AnalyticsService implements IAnalyticsService {
  constructor(private readonly prisma: PrismaClient) {}

  async getAnalytics(timeRange: AdminTimeRange = '30d'): Promise<AdminBIStats> {
    const now = new Date();
    let startDate: Date | undefined;

    if (timeRange === '7d') startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    else if (timeRange === '30d') startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    else if (timeRange === '90d') startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const [credits, workshops, activityHeatmap] = await Promise.all([
      this.getCreditsStats(startDate),
      this.getWorkshopStats(startDate),
      this.getActivityHeatmap(startDate)
    ]);

    return {
      credits,
      workshops,
      activityHeatmap
    };
  }

  private async getCreditsStats(startDate?: Date): Promise<CreditsStats> {
    const [totalBalanceResult, transactions] = await Promise.all([
      this.prisma.user.aggregate({
        _sum: {
          creditBalance: true
        }
      }),
      this.prisma.credit_transaction.findMany({
        where: startDate ? { createdAt: { gte: startDate } } : {},
        orderBy: { createdAt: 'asc' }
      })
    ]);

    let totalTopUps = 0;
    let totalUsage = 0;
    let totalRefunds = 0;

    const aggregatedTransactions: Record<string, number> = {};

    transactions.forEach(t => {
      if (t.type === 'TOP_UP') totalTopUps += t.amount;
      else if (t.type === 'USAGE') totalUsage += Math.abs(t.amount);
      else if (t.type === 'REFUND') totalRefunds += t.amount;

      const date = t.createdAt.toISOString().split('T')[0];
      aggregatedTransactions[date] = (aggregatedTransactions[date] || 0) + t.amount;
    });

    const transactionsOverTime = Object.entries(aggregatedTransactions).map(([date, amount]) => ({
      date,
      amount,
      type: 'BALANCE_CHANGE'
    })).sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalBalance: totalBalanceResult._sum.creditBalance || 0,
      totalTopUps,
      totalUsage,
      totalRefunds,
      transactionsOverTime
    };
  }

  private async getWorkshopStats(startDate?: Date): Promise<WorkshopStats> {
    const where = startDate ? { createdAt: { gte: startDate } } : {};

    const [totalWorkshops, workshopsByDomain, workshopsByTopic, workshopsStatus] = await Promise.all([
      this.prisma.workshop.count({ where }),
      this.prisma.workshop.groupBy({
        by: ['domain'],
        _count: { _all: true },
        where
      }),
      this.prisma.workshop.groupBy({
        by: ['topic'],
        _count: { _all: true },
        where
      }),
      this.prisma.workshop.groupBy({
        by: ['status'],
        _count: { _all: true },
        where
      })
    ]);

    return {
      totalWorkshops,
      workshopsByDomain: workshopsByDomain.map(d => ({
        domain: d.domain || 'Unknown',
        count: d._count._all
      })),
      workshopsByTopic: workshopsByTopic.map(t => ({
        topic: t.topic || 'Unknown',
        count: t._count._all
      })),
      workshopsStatusDistribution: workshopsStatus.map(s => ({
        status: s.status,
        count: s._count._all
      }))
    };
  }

  private async getActivityHeatmap(startDate?: Date): Promise<ActivityHeatmap[]> {
    const where = startDate ? { createdAt: { gte: startDate } } : {};

    // Get message counts by hour
    const messages = await this.prisma.message.findMany({
      where,
      select: { createdAt: true }
    });

    const heatmapData: Record<string, ActivityHeatmap> = {};

    messages.forEach(m => {
      const date = m.createdAt.toISOString().split('T')[0];
      const hour = m.createdAt.getUTCHours();
      const key = `${date}-${hour}-MESSAGE`;

      if (!heatmapData[key]) {
        heatmapData[key] = { date, hour, count: 0, type: 'MESSAGE' };
      }
      heatmapData[key].count++;
    });

    // For user lastSeen, we only have the CURRENT lastSeen.
    // It's not history, but we can still show a distribution of when users were last seen active.
    const users = await this.prisma.user.findMany({
      where: startDate ? { lastSeen: { gte: startDate } } : { lastSeen: { not: null } },
      select: { lastSeen: true }
    });

    users.forEach(u => {
      if (!u.lastSeen) return;
      const date = u.lastSeen.toISOString().split('T')[0];
      const hour = u.lastSeen.getUTCHours();
      const key = `${date}-${hour}-LOGIN`;

      if (!heatmapData[key]) {
        heatmapData[key] = { date, hour, count: 0, type: 'LOGIN' };
      }
      heatmapData[key].count++;
    });

    return Object.values(heatmapData);
  }
}
