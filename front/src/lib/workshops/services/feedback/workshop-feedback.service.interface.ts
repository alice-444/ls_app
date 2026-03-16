import type { Result } from "../../../common";

export interface SubmitFeedbackInput {
  workshopId: string;
  rating: number;
  comment?: string | null;
  isAnonymous: boolean;
}

export interface WorkshopFeedbackEntity {
  id: string;
  mentorId: string;
  apprenticeId: string;
  workshopId: string;
  rating: number;
  comment: string | null;
  isAnonymous: boolean;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWorkshopFeedbackService {
  submitFeedback(
    userId: string,
    input: SubmitFeedbackInput
  ): Promise<
    Result<{
      feedbackId: string;
      mentorUserId: string | null;
      creditRewarded: boolean;
    }>
  >;

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

  approveFeedback(feedbackId: string): Promise<Result<{ success: boolean }>>;

  deleteFeedback(feedbackId: string): Promise<Result<{ success: boolean }>>;

  warnUser(feedbackId: string): Promise<Result<{ success: boolean }>>;

  getEligibleWorkshopsForFeedback(userId: string): Promise<
    Result<
      Array<{
        workshopId: string;
        workshopTitle: string;
        workshopEndTime: Date;
        hoursSinceEnd: number;
        shouldShowImmediately: boolean;
      }>
    >
  >;
}
