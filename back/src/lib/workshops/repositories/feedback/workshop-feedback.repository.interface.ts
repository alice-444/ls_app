import type { FeedbackStatus } from '@/lib/prisma';

export interface WorkshopFeedbackEntity {
  id: string;
  mentorId: string;
  apprenticeId: string;
  workshopId: string | null;
  rating: number;
  comment: string | null;
  isAnonymous: boolean;
  status: FeedbackStatus;
  reportedAt: Date | null;
  reportedBy: string | null;
  reportReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  apprentice?: {
    id: string;
    user?: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
    };
  };
  mentor?: {
    id: string;
    user?: {
      id: string;
      name: string | null;
    };
  };
  workshop?: {
    id: string;
    title: string;
    date: Date | null;
    time: string | null;
    duration: number | null;
  };
}

export interface CreateWorkshopFeedbackInput {
  mentorId: string;
  apprenticeId: string;
  workshopId: string;
  rating: number;
  comment?: string | null;
  isAnonymous: boolean;
}

export interface IWorkshopFeedbackRepository {
  create(input: CreateWorkshopFeedbackInput): Promise<WorkshopFeedbackEntity>;
  findByApprenticeIdAndWorkshopId(
    apprenticeId: string,
    workshopId: string
  ): Promise<WorkshopFeedbackEntity | null>;
  findByMentorId(
    mentorId: string,
    options?: {
      limit?: number;
      offset?: number;
      includeDeleted?: boolean;
    }
  ): Promise<WorkshopFeedbackEntity[]>;
  findByWorkshopId(
    workshopId: string,
    options?: {
      limit?: number;
      offset?: number;
      includeDeleted?: boolean;
    }
  ): Promise<WorkshopFeedbackEntity[]>;
  findById(id: string): Promise<WorkshopFeedbackEntity | null>;
  updateStatus(
    id: string,
    status: FeedbackStatus,
    reportedBy?: string | null,
    reportReason?: string | null
  ): Promise<WorkshopFeedbackEntity>;
  countByMentorId(mentorId: string, includeDeleted?: boolean): Promise<number>;
  findUnderReview(
    options?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<WorkshopFeedbackEntity[]>;
  countUnderReview(): Promise<number>;
}
