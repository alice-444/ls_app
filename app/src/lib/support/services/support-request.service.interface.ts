import { support_request } from "@/lib/prisma-server";
import { SupportRequestDetailed, SupportMessage } from "@ls-app/shared";

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
  getAdminSupportQueue(params?: {
    limit?: number;
    offset?: number;
    status?: string;
  }): Promise<any[]>;
  updateSupportRequestStatus(
    requestId: string,
    status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED',
    adminId?: string
  ): Promise<support_request>;
  getSupportRequestById(requestId: string): Promise<support_request | null>;
  getSupportRequestDetailed(requestId: string): Promise<SupportRequestDetailed | null>;
  getMyRequests(userId: string): Promise<support_request[]>;
  addMessage(params: {
    requestId: string;
    content: string;
    senderId?: string;
    isAdmin?: boolean;
  }): Promise<SupportMessage>;
}
