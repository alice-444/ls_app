export interface AdminStats {
  reports: number;
  moderation: number;
  support: number;
  onboarding: number;
}

export interface IAdminService {
  getStats(): Promise<AdminStats>;
  getOnboardingQueue(params?: { limit?: number; offset?: number }): Promise<any>;
}
