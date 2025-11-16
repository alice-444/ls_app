import type {
  IMentorRepository,
  MentorEntity,
  MentorFeedbackEntity,
  MentorWorkshopEntity,
} from "./mentor.repository.interface";

export class PrismaMentorRepository implements IMentorRepository {
  constructor(private readonly prisma: any) {}

  async findPublishedMentorById(id: string): Promise<MentorEntity | null> {
    const mentor = await this.prisma.appUser.findUnique({
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
    const mentor = await this.prisma.appUser.findUnique({
      where: { id },
    });

    if (!mentor || !mentor.isPublished || mentor.role !== "PROF") {
      return null;
    }

    return mentor as MentorEntity;
  }

  async findApprenticeByUserId(userId: string): Promise<MentorEntity | null> {
    const apprentice = await this.prisma.appUser.findUnique({
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

    const feedbacks = await this.prisma.mentorFeedback.findMany({
      where,
      include: {
        apprentice: {
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

    return feedbacks as MentorFeedbackEntity[];
  }

  async findMentorPublicWorkshops(
    mentorId: string
  ): Promise<MentorWorkshopEntity[]> {
    const workshops = await this.prisma.workshop.findMany({
      where: {
        creatorId: mentorId,
        status: "PUBLISHED",
      },
      include: {
        feedbacks: {
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

