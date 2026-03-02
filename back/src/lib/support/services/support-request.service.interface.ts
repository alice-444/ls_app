import { SupportRequest } from "@prisma/client";

export interface CreateSupportRequestCommand {
  userId?: string;
  email: string;
  subject: string;
  description: string;
  problemType: string;
  attachments?: any;
}

export interface ISupportRequestService {
  createSupportRequest(command: CreateSupportRequestCommand): Promise<SupportRequest>;
  getAdminSupportQueue(params?: { limit?: number; offset?: number; status?: string }): Promise<SupportRequest[]>;
  updateSupportRequestStatus(requestId: string, status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"): Promise<SupportRequest>;
  getSupportRequestById(requestId: string): Promise<SupportRequest | null>;
}
