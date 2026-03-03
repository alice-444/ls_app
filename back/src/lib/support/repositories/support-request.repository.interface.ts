import type { support_request } from "../../../../prisma/generated/client/client";

export interface CreateSupportRequestInput {
  appUserId: string;
  subject: string;
  message: string;
  status?: string;
}

export interface UpdateSupportRequestInput {
  status?: string;
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
