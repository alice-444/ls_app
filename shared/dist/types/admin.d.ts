export interface AdminStats {
  reports: number;
  moderation: number;
  support: number;
  onboarding: number;
}
export type AdminTimeRange = "7d" | "30d" | "90d" | "all";
export interface CreditsStats {
  totalBalance: number;
  totalTopUps: number;
  totalUsage: number;
  totalRefunds: number;
  transactionsOverTime: {
    date: string;
    amount: number;
    type: string;
  }[];
}
export interface WorkshopStats {
  totalWorkshops: number;
  workshopsByDomain: {
    domain: string;
    count: number;
  }[];
  workshopsByTopic: {
    topic: string;
    count: number;
  }[];
  workshopsStatusDistribution: {
    status: string;
    count: number;
  }[];
  completionRate: number;
  cancellationRate: number;
  averageCompletionTime: number;
}
export interface CommunityMap {
  domain: string;
  supply: number;
  demand: number;
}
export interface ActivityHeatmap {
  dayOfWeek: number;
  hour: number;
  count: number;
  type: "MESSAGE" | "LOGIN";
}
export interface AdminBIStats {
  credits: CreditsStats;
  workshops: WorkshopStats;
  activityHeatmap: ActivityHeatmap[];
  communityMap: CommunityMap[];
}
