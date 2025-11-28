import type { Result } from "../../common";

export interface IWorkshopFeedbackService {
  submitFeedback(
    userId: string,
    input: {
      workshopId: string;
      rating: number;
      comment?: string | null;
      isAnonymous: boolean;
    }
  ): Promise<Result<{ feedbackId: string }>>;

  canSubmitFeedback(
    userId: string,
    workshopId: string
  ): Promise<Result<{ canSubmit: boolean; reason?: string }>>;

  getFeedbackByWorkshop(
    workshopId: string,
    options?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<Result<any>>;

  reportFeedback(
    userId: string,
    feedbackId: string,
    reason: string
  ): Promise<Result<{ success: boolean }>>;

  getModerationQueue(options?: {
    limit?: number;
    offset?: number;
  }): Promise<Result<any>>;

  dismissReport(feedbackId: string): Promise<Result<{ success: boolean }>>;

  deleteFeedback(feedbackId: string): Promise<Result<{ success: boolean }>>;

  warnUser(feedbackId: string): Promise<Result<{ success: boolean }>>;
}
