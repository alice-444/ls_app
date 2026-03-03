import type {
  IMentorRepository,
  MentorEntity,
  MentorFeedbackEntity,
  MentorWorkshopEntity,
} from "./mentor.repository.interface";

export class PrismaMentorRepository implements IMentorRepository {
  constructor(private readonly prisma: any) {}

  async findPublishedMentorById(id: string): Promise<MentorEntity | null> {
    const mentor = await this.prisma.user.findUnique({
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

    if (!mentor || !mentor.isPublished || mentor.role !== "MENTOR") {
      return null;
    }

    return mentor as MentorEntity;
  }

  async findMentorById(id: string): Promise<MentorEntity | null> {
    const mentor = await this.prisma.user.findFirst({
      where: {
        OR: [{ id }, { userId: id }],
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

    if (!mentor || !mentor.isPublished || mentor.role !== "MENTOR") {
      return null;
    }

    return mentor as MentorEntity;
  }

  async findApprenticeByUserId(userId: string): Promise<MentorEntity | null> {
    const apprentice = await this.prisma.user.findUnique({
      where: { userId },
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
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user_mentor_feedback_apprenticeIdTouser: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
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
    });

    return feedbacks.map((f: any) => ({
      ...f,
      apprentice: f.user_mentor_feedback_apprenticeIdTouser,
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
