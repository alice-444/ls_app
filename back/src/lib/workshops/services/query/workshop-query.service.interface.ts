import type { Result } from "../../../common";

export interface IWorkshopQueryService {
  getWorkshopsByCreator(
    userId: string,
    status?: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED"
  ): Promise<Result<any[]>>;
  getPublishedWorkshops(): Promise<Result<any[]>>;
  getWorkshopById(workshopId: string): Promise<Result<any>>;
  getAllTopics(): Promise<Result<string[]>>;
}

export interface IWorkshopApprenticeQueryService {
  getConfirmedWorkshopsForApprentice(userId: string): Promise<Result<any[]>>;
  getUpcomingWorkshopsForApprentice(userId: string): Promise<Result<any[]>>;
  getWorkshopHistoryForApprentice(userId: string): Promise<Result<any[]>>;
  getAvailableWorkshopsForApprentice(userId: string): Promise<Result<any[]>>;
}
