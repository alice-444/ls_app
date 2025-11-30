import type { PrismaClient } from "../../../../prisma/generated/client/client";
import type {
  IWorkshopFeedbackRepository,
  WorkshopFeedbackEntity,
  CreateWorkshopFeedbackInput,
} from "./workshop-feedback.repository.interface";
import { generateInternalId } from "../../utils/id-generator";
import type { FeedbackStatus } from "../../../../prisma/generated/client/enums";

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
      include: {
        app_user_mentor_feedback_apprenticeIdToapp_user: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        app_user_mentor_feedback_mentorIdToapp_user: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        workshop: {
          select: {
            id: true,
            title: true,
            date: true,
            time: true,
            duration: true,
          },
        },
      },
    });

    return this.mapToEntity(feedback);
  }

  async findByApprenticeIdAndWorkshopId(
    apprenticeId: string,
    workshopId: string
  ): Promise<WorkshopFeedbackEntity | null> {
    const feedback = await (this.prisma as any).mentor_feedback.findUnique({
      where: {
        apprenticeId_workshopId: {
          apprenticeId,
          workshopId,
        },
      },
      include: {
        app_user_mentor_feedback_apprenticeIdToapp_user: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        app_user_mentor_feedback_mentorIdToapp_user: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        workshop: {
          select: {
            id: true,
            title: true,
            date: true,
            time: true,
            duration: true,
          },
        },
      },
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
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;
    const includeDeleted = options?.includeDeleted || false;

    const where: any = {
      mentorId,
    };

    if (!includeDeleted) {
      where.status = {
        not: "DELETED",
      };
    }

    const feedbacks = await (this.prisma as any).mentor_feedback.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        app_user_mentor_feedback_apprenticeIdToapp_user: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        app_user_mentor_feedback_mentorIdToapp_user: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        workshop: {
          select: {
            id: true,
            title: true,
            date: true,
            time: true,
            duration: true,
          },
        },
      },
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
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;
    const includeDeleted = options?.includeDeleted || false;

    const where: any = {
      workshopId,
    };

    if (!includeDeleted) {
      where.status = {
        not: "DELETED",
      };
    }

    const feedbacks = await (this.prisma as any).mentor_feedback.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        app_user_mentor_feedback_apprenticeIdToapp_user: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        app_user_mentor_feedback_mentorIdToapp_user: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        workshop: {
          select: {
            id: true,
            title: true,
            date: true,
            time: true,
            duration: true,
          },
        },
      },
    });

    return feedbacks.map((f: any) => this.mapToEntity(f));
  }

  async findById(id: string): Promise<WorkshopFeedbackEntity | null> {
    const feedback = await (this.prisma as any).mentor_feedback.findUnique({
      where: { id },
      include: {
        app_user_mentor_feedback_apprenticeIdToapp_user: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        app_user_mentor_feedback_mentorIdToapp_user: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        workshop: {
          select: {
            id: true,
            title: true,
            date: true,
            time: true,
            duration: true,
          },
        },
      },
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
      include: {
        app_user_mentor_feedback_apprenticeIdToapp_user: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        app_user_mentor_feedback_mentorIdToapp_user: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        workshop: {
          select: {
            id: true,
            title: true,
            date: true,
            time: true,
            duration: true,
          },
        },
      },
    });

    return this.mapToEntity(feedback);
  }

  async countByMentorId(
    mentorId: string,
    includeDeleted = false
  ): Promise<number> {
    const where: any = {
      mentorId,
    };

    if (!includeDeleted) {
      where.status = {
        not: "DELETED",
      };
    }

    return (this.prisma as any).mentor_feedback.count({ where });
  }

  async findUnderReview(options?: {
    limit?: number;
    offset?: number;
  }): Promise<WorkshopFeedbackEntity[]> {
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;

    const feedbacks = await (this.prisma as any).mentor_feedback.findMany({
      where: {
        status: "UNDER_REVIEW",
      },
      take: limit,
      skip: offset,
      orderBy: {
        reportedAt: "desc",
      },
      include: {
        app_user_mentor_feedback_apprenticeIdToapp_user: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        app_user_mentor_feedback_mentorIdToapp_user: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        workshop: {
          select: {
            id: true,
            title: true,
            date: true,
            time: true,
            duration: true,
          },
        },
      },
    });

    return feedbacks.map((f: any) => this.mapToEntity(f));
  }

  async countUnderReview(): Promise<number> {
    return (this.prisma as any).mentor_feedback.count({
      where: {
        status: "UNDER_REVIEW",
      },
    });
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
      apprentice: feedback.app_user_mentor_feedback_apprenticeIdToapp_user
        ? {
            id: feedback.app_user_mentor_feedback_apprenticeIdToapp_user.id,
            user: feedback.app_user_mentor_feedback_apprenticeIdToapp_user.user
              ? {
                  id: feedback.app_user_mentor_feedback_apprenticeIdToapp_user
                    .user.id,
                  name: feedback.app_user_mentor_feedback_apprenticeIdToapp_user
                    .user.name,
                  email:
                    feedback.app_user_mentor_feedback_apprenticeIdToapp_user
                      .user.email,
                  image:
                    feedback.app_user_mentor_feedback_apprenticeIdToapp_user
                      .user.image,
                }
              : undefined,
          }
        : undefined,
      mentor: feedback.app_user_mentor_feedback_mentorIdToapp_user
        ? {
            id: feedback.app_user_mentor_feedback_mentorIdToapp_user.id,
            user: feedback.app_user_mentor_feedback_mentorIdToapp_user.user
              ? {
                  id: feedback.app_user_mentor_feedback_mentorIdToapp_user.user
                    .id,
                  name: feedback.app_user_mentor_feedback_mentorIdToapp_user
                    .user.name,
                }
              : undefined,
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
