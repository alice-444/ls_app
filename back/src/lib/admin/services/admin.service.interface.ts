export interface AdminStats {
  reports: number;
  moderation: number;
  support: number;
  onboarding: number;
}

export interface IAdminService {
  getStats(): Promise<AdminStats>;
  getOnboardingQueue(params?: { limit?: number; offset?: number }): Promise<any>;
  approveUser(userId: string): Promise<any>;
  rejectUser(userId: string, reason?: string): Promise<any>;
  getAuditLogs(params: {
    limit: number;
    offset: number;
    searchTerm?: string;
  }): Promise<{ logs: any[]; total: number }>;
}
