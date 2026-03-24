import type { PrismaClient } from '@/lib/prisma-server';
import type {
  IWorkshopFeedbackRepository,
  WorkshopFeedbackEntity,
  CreateWorkshopFeedbackInput,
} from "./workshop-feedback.repository.interface";
import { generateInternalId } from "../../../utils/id-generator";
import type { FeedbackStatus } from '@/lib/prisma-server';

const FEEDBACK_INCLUDE = {
  apprentice: {
    select: { id: true, name: true, email: true, photoUrl: true, displayName: true },
  },
  mentor: {
    select: { id: true, name: true, displayName: true },
  },
  workshop: {
    select: { id: true, title: true, date: true, time: true, duration: true },
  },
} as const;

export class PrismaWorkshopFeedbackRepository
  implements IWorkshopFeedbackRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  async create(
    input: CreateWorkshopFeedbackInput
  ): Promise<WorkshopFeedbackEntity> {
    const now = new Date();
    const feedback = await (this.prisma as any).mentor_feedback.create({
      data: {
        id: generateInternalId(),
        mentorId: input.mentorId,
        apprenticeId: input.apprenticeId,
        workshopId: input.workshopId,
        rating: input.rating,
        comment: input.comment ?? null,
        isAnonymous: input.isAnonymous,
        status: "ACTIVE",
        createdAt: now,
        updatedAt: now,
      },
      include: FEEDBACK_INCLUDE,
    });

    return this.mapToEntity(feedback);
  }

  async findByApprenticeIdAndWorkshopId(
    apprenticeId: string,
    workshopId: string
  ): Promise<WorkshopFeedbackEntity | null> {
    const feedback = await (this.prisma as any).mentor_feedback.findUnique({
      where: {
        apprenticeId_workshopId: { apprenticeId, workshopId },
      },
      include: FEEDBACK_INCLUDE,
    });

    return feedback ? this.mapToEntity(feedback) : null;
  }

  async findByMentorId(
    mentorId: string,
    options?: {
      limit?: number;
      offset?: number;
      includeDeleted?: boolean;
    }
  ): Promise<WorkshopFeedbackEntity[]> {
    const feedbacks = await (this.prisma as any).mentor_feedback.findMany({
      where: this.buildStatusFilter({ mentorId }, options?.includeDeleted),
      take: options?.limit || 50,
      skip: options?.offset || 0,
      orderBy: { createdAt: "desc" },
      include: FEEDBACK_INCLUDE,
    });

    return feedbacks.map((f: any) => this.mapToEntity(f));
  }

  async findByWorkshopId(
    workshopId: string,
    options?: {
      limit?: number;
      offset?: number;
      includeDeleted?: boolean;
    }
  ): Promise<WorkshopFeedbackEntity[]> {
    const feedbacks = await (this.prisma as any).mentor_feedback.findMany({
      where: this.buildStatusFilter({ workshopId }, options?.includeDeleted),
      take: options?.limit || 50,
      skip: options?.offset || 0,
      orderBy: { createdAt: "desc" },
      include: FEEDBACK_INCLUDE,
    });

    return feedbacks.map((f: any) => this.mapToEntity(f));
  }

  async findById(id: string): Promise<WorkshopFeedbackEntity | null> {
    const feedback = await (this.prisma as any).mentor_feedback.findUnique({
      where: { id },
      include: FEEDBACK_INCLUDE,
    });

    return feedback ? this.mapToEntity(feedback) : null;
  }

  async updateStatus(
    id: string,
    status: FeedbackStatus,
    reportedBy?: string | null,
    reportReason?: string | null
  ): Promise<WorkshopFeedbackEntity> {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (status === "UNDER_REVIEW") {
      updateData.reportedAt = new Date();
      updateData.reportedBy = reportedBy ?? null;
      updateData.reportReason = reportReason ?? null;
    }

    const feedback = await (this.prisma as any).mentor_feedback.update({
      where: { id },
      data: updateData,
      include: FEEDBACK_INCLUDE,
    });

    return this.mapToEntity(feedback);
  }

  async countByMentorId(
    mentorId: string,
    includeDeleted = false
  ): Promise<number> {
    return (this.prisma as any).mentor_feedback.count({
      where: this.buildStatusFilter({ mentorId }, includeDeleted),
    });
  }

  async findUnderReview(options?: {
    limit?: number;
    offset?: number;
  }): Promise<WorkshopFeedbackEntity[]> {
    const feedbacks = await (this.prisma as any).mentor_feedback.findMany({
      where: { status: "UNDER_REVIEW" },
      take: options?.limit || 50,
      skip: options?.offset || 0,
      orderBy: { reportedAt: "desc" },
      include: FEEDBACK_INCLUDE,
    });

    return feedbacks.map((f: any) => this.mapToEntity(f));
  }

  async countUnderReview(): Promise<number> {
    return (this.prisma as any).mentor_feedback.count({
      where: { status: "UNDER_REVIEW" },
    });
  }

  private buildStatusFilter(
    baseFilter: Record<string, string>,
    includeDeleted?: boolean
  ): Record<string, any> {
    if (includeDeleted) return baseFilter;
    return { ...baseFilter, status: { not: "DELETED" } };
  }

  private mapToEntity(feedback: any): WorkshopFeedbackEntity {
    return {
      id: feedback.id,
      mentorId: feedback.mentorId,
      apprenticeId: feedback.apprenticeId,
      workshopId: feedback.workshopId,
      rating: feedback.rating,
      comment: feedback.comment,
      isAnonymous: feedback.isAnonymous,
      status: feedback.status,
      reportedAt: feedback.reportedAt,
      reportedBy: feedback.reportedBy,
      reportReason: feedback.reportReason,
      createdAt: feedback.createdAt,
      updatedAt: feedback.updatedAt,
      apprentice: feedback.apprentice
        ? {
            id: feedback.apprentice.id,
            user: {
              id: feedback.apprentice.id,
              name: feedback.apprentice.name,
              email: feedback.apprentice.email,
              image: feedback.apprentice.photoUrl,
            },
          }
        : undefined,
      mentor: feedback.mentor
        ? {
            id: feedback.mentor.id,
            user: {
              id: feedback.mentor.id,
              name: feedback.mentor.name,
            },
          }
        : undefined,
      workshop: feedback.workshop
        ? {
            id: feedback.workshop.id,
            title: feedback.workshop.title,
            date: feedback.workshop.date,
            time: feedback.workshop.time,
            duration: feedback.workshop.duration,
          }
        : undefined,
    };
  }
}
