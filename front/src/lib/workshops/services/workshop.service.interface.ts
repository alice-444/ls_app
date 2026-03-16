import type { Result } from "../../common";
import type { WorkshopResponseDTO } from "../dto/workshop.dto";

export interface IWorkshopService {
  createWorkshop(
    userId: string,
    input: unknown
  ): Promise<Result<{ workshopId: string }>>;

  updateWorkshop(
    userId: string,
    input: unknown
  ): Promise<Result<{ success: boolean }>>;

  publishWorkshop(
    userId: string,
    input: unknown
  ): Promise<Result<{ success: boolean; publishedAt: Date }>>;

  unpublishWorkshop(
    userId: string,
    input: unknown
  ): Promise<Result<{ success: boolean }>>;

  deleteWorkshop(
    userId: string,
    input: unknown
  ): Promise<Result<{ success: boolean }>>;

  cancelWorkshop(
    userId: string,
    input: unknown
  ): Promise<Result<{ success: boolean }>>;

  getWorkshopsByCreator(
    userId: string,
    status?: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED"
  ): Promise<Result<WorkshopResponseDTO[]>>;

  getPublishedWorkshops(): Promise<Result<WorkshopResponseDTO[]>>;

  getWorkshopById(workshopId: string): Promise<Result<WorkshopResponseDTO>>;

  getConfirmedWorkshopsForApprentice(
    userId: string
  ): Promise<Result<WorkshopResponseDTO[]>>;

  updateWorkshopScheduling(
    userId: string,
    workshopId: string,
    input: {
      date?: Date | null;
      time?: string | null;
      duration?: number | null;
      location?: string | null;
    }
  ): Promise<Result<{ success: boolean }>>;

  cancelConfirmedWorkshop(
    userId: string,
    workshopId: string,
    cancellationReason?: string
  ): Promise<Result<{ success: boolean }>>;

  getUpcomingWorkshopsForApprentice(
    userId: string
  ): Promise<Result<WorkshopResponseDTO[]>>;

  getWorkshopHistoryForApprentice(
    userId: string
  ): Promise<Result<WorkshopResponseDTO[]>>;

  getAvailableWorkshopsForApprentice(
    userId: string
  ): Promise<Result<WorkshopResponseDTO[]>>;

  rescheduleWorkshop(
    userId: string,
    workshopId: string,
    input: {
      date: Date;
      time: string;
      duration?: number | null;
      location?: string | null;
    }
  ): Promise<Result<{ success: boolean; oldDate: Date | null; oldTime: string | null }>>;

  getAllTopics(): Promise<Result<string[]>>;
}
