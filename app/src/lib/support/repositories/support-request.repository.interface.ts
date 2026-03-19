import type { support_request } from '@/lib/prisma-server';

export interface CreateSupportRequestInput {
  userId?: string | null;
  email: string;
  subject: string;
  description: string;
  problemType: string;
  status?: string;
  attachments?: any;
}

export interface UpdateSupportRequestInput {
  status?: string;
  description?: string;
  attachments?: any;
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
