import type { Result } from "../../common";
import type { IWorkshopRepository } from "../repositories/workshop.repository.interface";
import type { AppUserRepository } from "../../users/repositories";
import type { IWorkshopRequestRepository } from "../../mentors/repositories/workshop-request.repository.interface";
import type { INotificationService } from "../../notifications/services/notification.service.interface";
import type { IWorkshopService } from "./workshop.service.interface";
import type { IWorkshopVideoLinkService } from "./video/workshop-video-link.service.interface";
import type { IEmailService } from "../../email/services/email.service.interface";
import type { IUserBlockService } from "../../users/services/moderation/user-block.service.interface";
import type { ICreditService } from "../../credits/services/credit.service.interface";
import type { PrismaClient } from "@/lib/prisma-server";
import { WorkshopAccessGuard } from "./guards/workshop-access.guard";
import { WorkshopLifecycleService } from "./lifecycle/workshop-lifecycle.service";
import { WorkshopSchedulingService } from "./scheduling/workshop-scheduling.service";
import {
  WorkshopQueryService,
  WorkshopApprenticeQueryService,
} from "./query/workshop-query.service";
import { container as diContainer } from "../../di/container";
import type { WorkshopResponseDTO } from "../dto/workshop.dto";

export {
  createWorkshopBackendSchema as createWorkshopSchema,
  updateWorkshopBackendSchema as updateWorkshopSchema,
  publishWorkshopSchema,
  unpublishWorkshopSchema,
  deleteWorkshopSchema,
  cancelWorkshopSchema,
} from "@ls-app/shared";
export type {
  CreateWorkshopBackendInput as CreateWorkshopInput,
  UpdateWorkshopBackendInput as UpdateWorkshopInput,
  PublishWorkshopInput,
  DeleteWorkshopInput,
  UnpublishWorkshopInput,
  CancelWorkshopInput,
} from "@ls-app/shared";

export interface WorkshopServiceDependencies {
  readonly workshopRepository: IWorkshopRepository;
  readonly appUserRepository: AppUserRepository;
  readonly userBlockService: IUserBlockService;
  readonly workshopRequestRepository?: IWorkshopRequestRepository;
  readonly dbNotificationService?: INotificationService;
  readonly workshopVideoLinkService?: IWorkshopVideoLinkService;
  readonly emailService?: IEmailService;
  readonly creditService?: ICreditService;
  readonly prisma?: PrismaClient;
}

/**
 * Facade that composes specialized sub-services while preserving
 * the existing IWorkshopService contract for backward compatibility.
 */
export class WorkshopService implements IWorkshopService {
  private readonly lifecycleService: WorkshopLifecycleService;
  private readonly schedulingService: WorkshopSchedulingService;
  private readonly queryService: WorkshopQueryService;
  private readonly apprenticeQueryService: WorkshopApprenticeQueryService;

  constructor(deps: WorkshopServiceDependencies) {
    const {
      workshopRepository,
      appUserRepository,
      userBlockService,
      workshopRequestRepository,
      dbNotificationService,
      workshopVideoLinkService,
      emailService,
      creditService,
      prisma,
    } = deps;
    const accessGuard = new WorkshopAccessGuard(
      appUserRepository,
      workshopRepository,
    );

    this.lifecycleService = new WorkshopLifecycleService(
      workshopRepository,
      accessGuard,
      dbNotificationService,
    );

    this.schedulingService = new WorkshopSchedulingService(
      workshopRepository,
      accessGuard,
      dbNotificationService,
      emailService,
      appUserRepository,
      creditService,
      prisma,
    );

    const videoLinkService =
      workshopVideoLinkService ?? diContainer.workshopVideoLinkService;

    this.queryService = new WorkshopQueryService(
      workshopRepository,
      accessGuard,
      videoLinkService,
    );

    this.apprenticeQueryService = new WorkshopApprenticeQueryService(
      workshopRepository,
      accessGuard,
      userBlockService,
      videoLinkService,
      workshopRequestRepository,
    );
  }

  createWorkshop(
    userId: string,
    input: unknown,
  ): Promise<Result<{ workshopId: string }>> {
    return this.lifecycleService.createWorkshop(userId, input);
  }

  updateWorkshop(
    userId: string,
    input: unknown,
  ): Promise<Result<{ success: boolean }>> {
    return this.lifecycleService.updateWorkshop(userId, input);
  }

  publishWorkshop(
    userId: string,
    input: unknown,
  ): Promise<Result<{ success: boolean; publishedAt: Date }>> {
    return this.lifecycleService.publishWorkshop(userId, input);
  }

  unpublishWorkshop(
    userId: string,
    input: unknown,
  ): Promise<Result<{ success: boolean }>> {
    return this.lifecycleService.unpublishWorkshop(userId, input);
  }

  deleteWorkshop(
    userId: string,
    input: unknown,
  ): Promise<Result<{ success: boolean }>> {
    return this.lifecycleService.deleteWorkshop(userId, input);
  }

  cancelWorkshop(
    userId: string,
    input: unknown,
  ): Promise<Result<{ success: boolean }>> {
    return this.lifecycleService.cancelWorkshop(userId, input);
  }

  getWorkshopsByCreator(
    userId: string,
    status?: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED",
  ): Promise<Result<WorkshopResponseDTO[]>> {
    return this.queryService.getWorkshopsByCreator(userId, status);
  }

  getPublishedWorkshops(): Promise<Result<WorkshopResponseDTO[]>> {
    return this.queryService.getPublishedWorkshops();
  }

  getWorkshopById(workshopId: string): Promise<Result<WorkshopResponseDTO>> {
    return this.queryService.getWorkshopById(workshopId);
  }

  getConfirmedWorkshopsForApprentice(
    userId: string,
  ): Promise<Result<WorkshopResponseDTO[]>> {
    return this.apprenticeQueryService.getConfirmedWorkshopsForApprentice(
      userId,
    );
  }

  updateWorkshopScheduling(
    userId: string,
    workshopId: string,
    input: {
      date?: Date | null;
      time?: string | null;
      duration?: number | null;
      location?: string | null;
    },
  ): Promise<Result<{ success: boolean }>> {
    return this.schedulingService.updateWorkshopScheduling(
      userId,
      workshopId,
      input,
    );
  }

  cancelConfirmedWorkshop(
    userId: string,
    workshopId: string,
    cancellationReason?: string,
  ): Promise<Result<{ success: boolean }>> {
    return this.schedulingService.cancelConfirmedWorkshop(
      userId,
      workshopId,
      cancellationReason,
    );
  }

  getUpcomingWorkshopsForApprentice(
    userId: string,
  ): Promise<Result<WorkshopResponseDTO[]>> {
    return this.apprenticeQueryService.getUpcomingWorkshopsForApprentice(
      userId,
    );
  }

  getWorkshopHistoryForApprentice(
    userId: string,
  ): Promise<Result<WorkshopResponseDTO[]>> {
    return this.apprenticeQueryService.getWorkshopHistoryForApprentice(userId);
  }

  getAvailableWorkshopsForApprentice(
    userId: string,
  ): Promise<Result<WorkshopResponseDTO[]>> {
    return this.apprenticeQueryService.getAvailableWorkshopsForApprentice(
      userId,
    );
  }

  rescheduleWorkshop(
    userId: string,
    workshopId: string,
    input: {
      date: Date;
      time: string;
      duration?: number | null;
      location?: string | null;
    },
  ): Promise<
    Result<{ success: boolean; oldDate: Date | null; oldTime: string | null }>
  > {
    return this.schedulingService.rescheduleWorkshop(userId, workshopId, input);
  }

  getAllTopics(): Promise<Result<string[]>> {
    return this.queryService.getAllTopics();
  }
}
