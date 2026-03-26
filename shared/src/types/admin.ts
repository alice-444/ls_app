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
  averageCompletionTime: number; // en heures
}

export interface CommunityMap {
  domain: string;
  supply: number; // Nombre de mentors offrant ce domaine
  demand: number; // Nombre de demandes d'ateliers (workshop_requests) dans ce domaine
}

export interface ActivityHeatmap {
  dayOfWeek: number; // 0 (Sunday) to 6 (Saturday)
  hour: number; // 0 to 23
  count: number;
  type: "MESSAGE" | "LOGIN";
}

export interface AdminBIStats {
  credits: CreditsStats;
  workshops: WorkshopStats;
  activityHeatmap: ActivityHeatmap[];
  communityMap: CommunityMap[];
}
