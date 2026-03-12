import { AdminStats } from "@ls-app/shared";

export interface IAdminService {
  getStats(): Promise<AdminStats>;
  getOnboardingQueue(params?: { limit?: number; offset?: number }): Promise<any>;
  approveUser(userId: string, adminId?: string): Promise<any>;
  rejectUser(userId: string, adminId?: string, reason?: string): Promise<any>;
  getAuditLogs(params: {
    limit: number;
    offset: number;
    searchTerm?: string;
  }): Promise<{ logs: any[]; total: number }>;
  getUser360(userId: string): Promise<any>;
  updateUserCredits(params: {
    adminId: string;
    userId: string;
    amount: number;
    reason: string;
    type: "ADD" | "REMOVE";
  }): Promise<any>;
  bulkApproveUsers(userIds: string[], adminId: string): Promise<any>;
  bulkRejectUsers(userIds: string[], adminId: string, reason?: string): Promise<any>;
}
