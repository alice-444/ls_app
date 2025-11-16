import type { Result } from "../../common";

export interface IMentorFeedbackService {
  getMentorFeedbacks(
    mentorId: string,
    filters?: {
      workshopId?: string;
    }
  ): Promise<Result<any>>;
}

