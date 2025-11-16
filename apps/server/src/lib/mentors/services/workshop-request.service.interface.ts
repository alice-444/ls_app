import type { Result } from "../../common";

export interface IWorkshopRequestService {
  submitWorkshopRequest(
    userId: string,
    input: {
      mentorId: string;
      title: string;
      description?: string | null;
      message?: string | null;
      preferredDate?: Date | null;
      preferredTime?: string | null;
      workshopId?: string | null;
    }
  ): Promise<Result<{ requestId: string }>>;
  getApprenticeRequests(
    userId: string
  ): Promise<Result<Array<any>>>;
  getMentorRequests(
    userId: string
  ): Promise<Result<Array<any>>>;
  getWorkshopRequests(
    workshopId: string
  ): Promise<Result<Array<any>>>;
  acceptWorkshopRequest(
    userId: string,
    requestId: string,
    input: {
      date: Date;
      time: string;
      duration?: number | null;
      location?: string | null;
      isVirtual?: boolean;
      maxParticipants?: number | null;
    }
  ): Promise<Result<{ workshopId: string; requestId: string }>>;
  rejectWorkshopRequest(
    userId: string,
    requestId: string
  ): Promise<Result<{ success: boolean }>>;
  cancelWorkshopRequest(
    userId: string,
    requestId: string
  ): Promise<Result<{ success: boolean }>>;
}

