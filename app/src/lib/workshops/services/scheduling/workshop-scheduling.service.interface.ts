import type { Result } from "../../../common";

export interface IWorkshopSchedulingService {
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

  rescheduleWorkshop(
    userId: string,
    workshopId: string,
    input: {
      date: Date;
      time: string;
      duration?: number | null;
      location?: string | null;
    }
  ): Promise<
    Result<{ success: boolean; oldDate: Date | null; oldTime: string | null }>
  >;
}
