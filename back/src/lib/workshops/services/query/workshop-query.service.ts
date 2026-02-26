import { Result, success } from "../../../common";
import type { IWorkshopRepository } from "../../repositories/workshop.repository.interface";
import type { IWorkshopAccessGuard } from "../guards/workshop-access.guard";
import type { IWorkshopQueryService, IWorkshopApprenticeQueryService } from "./workshop-query.service.interface";
import type { IWorkshopRequestRepository } from "../../../mentors/repositories/workshop-request.repository.interface";
import type { IWorkshopVideoLinkService } from "../video/workshop-video-link.service.interface";
import { failure } from "../../../common";
import {
  handleError,
  createErrorContext,
} from "../../../common/error-handler";
import { calculateWorkshopEndTime } from "../../utils/workshop-helpers";

export class WorkshopQueryService implements IWorkshopQueryService {
  constructor(
    private readonly workshopRepository: IWorkshopRepository,
    private readonly accessGuard: IWorkshopAccessGuard,
    private readonly workshopVideoLinkService: IWorkshopVideoLinkService
  ) {}

  async getWorkshopsByCreator(userId: string): Promise<Result<any[]>> {
    try {
      const accessCheck = await this.accessGuard.verifyProfAccess(userId);
      if (!accessCheck.ok) {
        return accessCheck;
      }

      const { appUser } = accessCheck.data;
      if (!appUser) {
        return failure("AppUser not found", 404);
      }

      const workshops = await this.workshopRepository.findByCreatorId(appUser.id);
      return success(workshops);
    } catch (error) {
      return handleError(
        error,
        createErrorContext("getWorkshopsByCreator", { userId })
      );
    }
  }

  async getPublishedWorkshops(): Promise<Result<any[]>> {
    try {
      const workshops = await this.workshopRepository.findPublished();
      return success(workshops);
    } catch (error) {
      return handleError(error, createErrorContext("getPublishedWorkshops"));
    }
  }

  async getWorkshopById(workshopId: string): Promise<Result<any>> {
    try {
      const workshop = await this.workshopRepository.findById(workshopId);
      if (!workshop) {
        return failure("Atelier non trouvé", 404);
      }

      const filteredWorkshop =
        this.workshopVideoLinkService.filterVideoLink(workshop);

      return success(filteredWorkshop);
    } catch (error) {
      return handleError(
        error,
        createErrorContext("getWorkshopById", { resourceId: workshopId })
      );
    }
  }
}

export class WorkshopApprenticeQueryService
  implements IWorkshopApprenticeQueryService
{
  constructor(
    private readonly workshopRepository: IWorkshopRepository,
    private readonly accessGuard: IWorkshopAccessGuard,
    private readonly workshopRequestRepository?: IWorkshopRequestRepository
  ) {}

  async getConfirmedWorkshopsForApprentice(
    userId: string
  ): Promise<Result<any[]>> {
    try {
      const accessCheck = await this.accessGuard.verifyApprenticeAccess(userId);
      if (!accessCheck.ok) {
        return accessCheck;
      }

      const { appUser } = accessCheck.data;
      const workshops = await this.workshopRepository.findByApprenticeId(appUser.id);

      const confirmedWorkshops = workshops.filter(
        (w) => w.date && w.time && w.status !== "CANCELLED"
      );

      return success(confirmedWorkshops);
    } catch (error) {
      return handleError(
        error,
        createErrorContext("getConfirmedWorkshopsForApprentice", { userId })
      );
    }
  }

  async getUpcomingWorkshopsForApprentice(
    userId: string
  ): Promise<Result<any[]>> {
    try {
      const accessCheck = await this.accessGuard.verifyApprenticeAccess(userId);
      if (!accessCheck.ok) {
        return accessCheck;
      }

      const { appUser } = accessCheck.data;
      const workshops = await this.workshopRepository.findByApprenticeId(appUser.id);

      const now = new Date();
      const upcomingWorkshops = workshops
        .filter((w) => {
          if (w.status === "CANCELLED") return false;

          if (w.date && w.time) {
            const endTime = calculateWorkshopEndTime(w.date, w.time, w.duration);
            return endTime && endTime >= now;
          }

          return !w.date || !w.time;
        })
        .sort((a, b) => {
          if (a.date && b.date) return a.date.getTime() - b.date.getTime();
          if (a.date && !b.date) return -1;
          if (!a.date && b.date) return 1;
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });

      return success(upcomingWorkshops);
    } catch (error) {
      return handleError(
        error,
        createErrorContext("getUpcomingWorkshopsForApprentice", { userId })
      );
    }
  }

  async getWorkshopHistoryForApprentice(
    userId: string
  ): Promise<Result<any[]>> {
    try {
      const accessCheck = await this.accessGuard.verifyApprenticeAccess(userId);
      if (!accessCheck.ok) {
        return accessCheck;
      }

      const { appUser } = accessCheck.data;
      const workshops = await this.workshopRepository.findByApprenticeId(appUser.id);

      const now = new Date();
      const historyWorkshops = workshops
        .filter((w) => {
          if (!w.date || !w.time) return false;
          const endTime = calculateWorkshopEndTime(w.date, w.time, w.duration);
          return endTime && endTime < now;
        })
        .sort((a, b) => {
          if (!a.date || !b.date) return 0;
          return b.date.getTime() - a.date.getTime();
        });

      return success(historyWorkshops);
    } catch (error) {
      return handleError(
        error,
        createErrorContext("getWorkshopHistoryForApprentice", { userId })
      );
    }
  }

  async getAvailableWorkshopsForApprentice(
    userId: string
  ): Promise<Result<any[]>> {
    try {
      const accessCheck = await this.accessGuard.verifyApprenticeAccess(userId);
      if (!accessCheck.ok) {
        return accessCheck;
      }

      const { appUser } = accessCheck.data;

      const publishedWorkshops = await this.workshopRepository.findPublished();
      const registeredWorkshops =
        await this.workshopRepository.findByApprenticeId(appUser.id);
      const registeredWorkshopIds = new Set(
        registeredWorkshops.map((w) => w.id)
      );

      let pendingRequestWorkshopIds = new Set<string>();
      if (this.workshopRequestRepository) {
        const pendingRequests =
          await this.workshopRequestRepository.findByApprenticeId(appUser.id);
        pendingRequestWorkshopIds = new Set(
          pendingRequests
            .filter((r) => r.status === "PENDING" && r.workshopId)
            .map((r) => r.workshopId!)
        );
      }

      const availableWorkshops = publishedWorkshops.filter(
        (w) =>
          !registeredWorkshopIds.has(w.id) &&
          !pendingRequestWorkshopIds.has(w.id) &&
          w.status === "PUBLISHED" &&
          w.apprenticeId === null
      );

      return success(availableWorkshops);
    } catch (error) {
      return handleError(
        error,
        createErrorContext("getAvailableWorkshopsForApprentice", { userId })
      );
    }
  }
}
