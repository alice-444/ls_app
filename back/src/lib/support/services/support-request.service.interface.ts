import type { support_request } from '@/lib/prisma';

export interface CreateSupportRequestCommand {
  userId?: string | null;
  email: string;
  subject: string;
  description: string;
  problemType: string;
  attachments?: any;
}

export interface ISupportRequestService {
  createSupportRequest(command: CreateSupportRequestCommand): Promise<support_request>;
  getAdminSupportQueue(params?: { limit?: number; offset?: number; status?: string }): Promise<any[]>;
  updateSupportRequestStatus(requestId: string, status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"): Promise<support_request>;
  getSupportRequestById(requestId: string): Promise<any | null>;
}
