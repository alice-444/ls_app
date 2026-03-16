import type { Result } from "../../../common";
import type { WorkshopResponseDTO } from "../../dto/workshop.dto";

export interface IWorkshopQueryService {
  getWorkshopsByCreator(
    userId: string,
    status?: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED"
  ): Promise<Result<WorkshopResponseDTO[]>>;
  getPublishedWorkshops(): Promise<Result<WorkshopResponseDTO[]>>;
  getWorkshopById(workshopId: string): Promise<Result<WorkshopResponseDTO>>;
  getAllTopics(): Promise<Result<string[]>>;
}

export interface IWorkshopApprenticeQueryService {
  getConfirmedWorkshopsForApprentice(userId: string): Promise<Result<WorkshopResponseDTO[]>>;
  getUpcomingWorkshopsForApprentice(userId: string): Promise<Result<WorkshopResponseDTO[]>>;
  getWorkshopHistoryForApprentice(userId: string): Promise<Result<WorkshopResponseDTO[]>>;
  getAvailableWorkshopsForApprentice(userId: string): Promise<Result<WorkshopResponseDTO[]>>;
}
