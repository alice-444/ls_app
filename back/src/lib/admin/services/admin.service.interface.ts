export interface AdminStats {
  reports: number;
  moderation: number;
  support: number;
  onboarding: number;
}

export interface IAdminService {
  getStats(): Promise<AdminStats>;
  getOnboardingQueue(params?: { limit?: number; offset?: number }): Promise<any>;
  approveUser(appUserId: string): Promise<any>;
  rejectUser(appUserId: string, reason?: string): Promise<any>;
}
