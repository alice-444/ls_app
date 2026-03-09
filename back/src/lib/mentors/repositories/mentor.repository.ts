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
    });

    if (!mentor || mentor.role !== "MENTOR") {
      return null;
    }

    return mentor as MentorEntity;
  }

  async findApprenticeByUserId(userId: string): Promise<MentorEntity | null> {
    const apprentice = await this.prisma.user.findUnique({
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
      orderBy: {
        createdAt: "desc",
      },
      include: {
        apprentice: {
          select: {
            id: true,
            name: true,
            photoUrl: true,
            displayName: true,
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

    return feedbacks as MentorFeedbackEntity[];
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
        mentorFeedbacks: {
          select: {
            rating: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    return workshops.map((w: any) => ({
      ...w,
      feedbacks: w.mentorFeedbacks,
    })) as MentorWorkshopEntity[];
  }

  async findPublicMentors(filters?: {
    domain?: string;
    topic?: string;
    limit?: number;
    cursor?: string;
  }): Promise<MentorEntity[]> {
    const where: any = {
      role: "MENTOR",
      isPublished: true,
      status: "ACTIVE",
    };

    if (filters?.domain) {
      where.domain = filters.domain;
    }

    if (filters?.topic) {
      where.mentorshipTopics = {
        has: filters.topic,
      };
    }

    if (filters?.cursor) {
      where.id = {
        gt: filters.cursor,
      };
    }

    const mentors = await (this.prisma as any).user.findMany({
      where,
      take: filters?.limit || 20,
      orderBy: {
        id: "asc",
      },
    });

    return mentors as MentorEntity[];
  }
}
