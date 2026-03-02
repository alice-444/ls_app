import {
  type support_request,
  SupportRequestStatus,
} from "../../../../prisma/generated/client/client";
import {
  CreateSupportRequestCommand,
  ISupportRequestService,
} from "./support-request.service.interface";
import { ISupportRequestRepository } from "../repositories/support-request.repository.interface";

export class SupportRequestService implements ISupportRequestService {
  constructor(
    private readonly supportRequestRepository: ISupportRequestRepository
  ) {}

  async createSupportRequest(command: CreateSupportRequestCommand): Promise<support_request> {
    return this.supportRequestRepository.create({
      ...command,
      status: SupportRequestStatus.PENDING,
    });
  }

  async getAdminSupportQueue(params?: {
    limit?: number;
    offset?: number;
    status?: string;
  }): Promise<support_request[]> {
    const where: any = {};
    if (params?.status) {
      where.status = params.status;
    }

    return this.supportRequestRepository.findMany({
      take: params?.limit ?? 50,
      skip: params?.offset ?? 0,
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  async updateSupportRequestStatus(
    requestId: string,
    status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
  ): Promise<support_request> {
    return this.supportRequestRepository.update(requestId, { status });
  }

  async getSupportRequestById(requestId: string): Promise<support_request | null> {
    return this.supportRequestRepository.findById(requestId);
  }
}
