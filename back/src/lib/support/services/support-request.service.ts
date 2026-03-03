import { type support_request } from "../../../../prisma/generated/client/client";
import { SupportRequestStatus } from "../types/support-types";
import {
  CreateSupportRequestCommand,
  ISupportRequestService,
} from "./support-request.service.interface";
import { ISupportRequestRepository } from "../repositories/support-request.repository.interface";
import { INotificationService } from "../../notifications/services/notification.service.interface";

export class SupportRequestService implements ISupportRequestService {
  constructor(
    private readonly supportRequestRepository: ISupportRequestRepository,
    private readonly notificationService: INotificationService
  ) {}

  async createSupportRequest(command: CreateSupportRequestCommand): Promise<support_request> {
    const request = await this.supportRequestRepository.create({
      appUserId: command.appUserId,
      subject: command.subject,
      message: command.message,
      status: SupportRequestStatus.PENDING,
    });

    // Notify admins
    await this.notificationService.notifyAdmin(
      "NEW_SUPPORT_REQUEST",
      `Nouvelle demande de support : ${command.subject}`,
      `/admin/support?requestId=${request.id}`
    );

    return request;
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
