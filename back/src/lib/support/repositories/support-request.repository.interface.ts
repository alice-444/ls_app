import type {
  support_request,
  SupportRequestStatus,
} from "../../../../prisma/generated/client/client";

export interface CreateSupportRequestInput {
  userId?: string | null;
  email: string;
  subject: string;
  description: string;
  problemType: string;
  status?: SupportRequestStatus;
  attachments?: any; // Consider a more specific type if possible
}

export interface UpdateSupportRequestInput {
  status?: SupportRequestStatus;
}

export interface ISupportRequestRepository {
  create(data: CreateSupportRequestInput): Promise<support_request>;
  findById(id: string): Promise<support_request | null>;
  findMany(params?: {
    skip?: number;
    take?: number;
    where?: any;
    orderBy?: any;
    include?: any;
  }): Promise<support_request[]>;
  count(where?: any): Promise<number>;
  update(
    id: string,
    data: UpdateSupportRequestInput
  ): Promise<support_request>;
}
