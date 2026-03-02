import { SupportRequest, SupportRequestStatus } from "@prisma/client";

export interface CreateSupportRequestInput {
  userId?: string | null;
  email: string;
  subject: string;
  description: string;
  problemType: string;
  attachments?: any; // Consider a more specific type if possible
}

export interface UpdateSupportRequestInput {
  status?: SupportRequestStatus;
}

export interface ISupportRequestRepository {
  create(data: CreateSupportRequestInput): Promise<SupportRequest>;
  findById(id: string): Promise<SupportRequest | null>;
  findMany(params?: {
    skip?: number;
    take?: number;
    where?: any;
    orderBy?: any;
    include?: any;
  }): Promise<SupportRequest[]>;
  count(where?: any): Promise<number>;
  update(
    id: string,
    data: UpdateSupportRequestInput
  ): Promise<SupportRequest>;
}
