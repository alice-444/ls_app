import { AdminBIStats, AdminTimeRange } from "@ls-app/shared";

export interface IAnalyticsService {
  getAnalytics(timeRange?: AdminTimeRange): Promise<AdminBIStats>;
}
