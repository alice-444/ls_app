import type {
  IMentorRepository,
  MentorEntity,
  MentorFeedbackEntity,
  MentorWorkshopEntity,
} from "./mentor.repository.interface";

export class PrismaMentorRepository implements IMentorRepository {
  constructor(private readonly prisma: any) {}

  async findPublishedMentorById(id: string): Promise<MentorEntity | null> {
    const mentor = await (this.prisma as any).app_user.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!mentor || !mentor.isPublished || mentor.role !== "PROF") {
      return null;
    }

    return mentor as MentorEntity;
  }

  async findMentorById(id: string): Promise<MentorEntity | null> {
    const mentor = await (this.prisma as any).app_user.findFirst({
      where: {
        OR: [
          { id },
          { userId: id },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!mentor || !mentor.isPublished || mentor.role !== "PROF") {
      return null;
    }

    return mentor as MentorEntity;
  }

  async findApprenticeByUserId(userId: string): Promise<MentorEntity | null> {
    const apprentice = await (this.prisma as any).app_user.findUnique({
      where: { userId },
    });

    return apprentice as MentorEntity | null;
  }

  async findMentorFeedbacks(
    mentorId: string,
    filters?: { workshopId?: string }
  ): Promise<MentorFeedbackEntity[]> {
    const where: any = {
      mentorId,
    };

    if (filters?.workshopId) {
      where.workshopId = filters.workshopId;
    }

    const feedbacks = await (this.prisma as any).mentor_feedback.findMany({
      where,
      include: {
        app_user_mentor_feedback_apprenticeIdToapp_user: {
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
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return feedbacks.map((f: any) => ({
      ...f,
      apprentice: f.app_user_mentor_feedback_apprenticeIdToapp_user,
    })) as MentorFeedbackEntity[];
  }

  async findMentorPublicWorkshops(
    mentorId: string
  ): Promise<MentorWorkshopEntity[]> {
    const workshops = await (this.prisma as any).workshop.findMany({
      where: {
        creatorId: mentorId,
        status: "PUBLISHED",
      },
      include: {
        mentor_feedback: {
          select: {
            rating: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    return workshops as MentorWorkshopEntity[];
  }
}
