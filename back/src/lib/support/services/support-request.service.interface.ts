import type { support_request } from "../../../../prisma/generated/client/client";

export interface CreateSupportRequestCommand {
  userId?: string;
  email: string;
  subject: string;
  description: string;
  problemType: string;
  attachments?: any;
}

export interface ISupportRequestService {
  createSupportRequest(command: CreateSupportRequestCommand): Promise<support_request>;
  getAdminSupportQueue(params?: { limit?: number; offset?: number; status?: string }): Promise<support_request[]>;
  updateSupportRequestStatus(requestId: string, status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"): Promise<support_request>;
  getSupportRequestById(requestId: string): Promise<support_request | null>;
}
