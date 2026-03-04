import type { Result } from "../../common";

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

  getWorkshopsByCreator(userId: string): Promise<Result<any[]>>;

  getPublishedWorkshops(): Promise<Result<any[]>>;

  getWorkshopById(workshopId: string): Promise<Result<any>>;

  getConfirmedWorkshopsForApprentice(
    userId: string
  ): Promise<Result<any[]>>;

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
  ): Promise<Result<any[]>>;

  getWorkshopHistoryForApprentice(
    userId: string
  ): Promise<Result<any[]>>;

  getAvailableWorkshopsForApprentice(
    userId: string
  ): Promise<Result<any[]>>;

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
}

