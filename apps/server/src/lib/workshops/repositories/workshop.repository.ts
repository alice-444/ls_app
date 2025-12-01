import type {
  IWorkshopRepository,
  CreateWorkshopInput,
  UpdateWorkshopInput,
  WorkshopEntity,
} from "./workshop.repository.interface";

export class PrismaWorkshopRepository implements IWorkshopRepository {
  constructor(private readonly prisma: any) {}
  async create(input: CreateWorkshopInput): Promise<WorkshopEntity> {
    const now = new Date();
    return (this.prisma as any).workshop.create({
      data: {
        id: crypto.randomUUID(),
        title: input.title,
        description: input.description,
        date: input.date,
        time: input.time,
        duration: input.duration,
        topic: input.topic,
        location: input.location,
        isVirtual: input.isVirtual ?? false,
        maxParticipants: input.maxParticipants,
        materialsNeeded: input.materialsNeeded,
        creditCost: input.creditCost ?? null,
        creatorId: input.creatorId,
        apprenticeId: input.apprenticeId ?? null,
        requestId: input.requestId ?? null,
        updatedAt: now,
      },
    });
  }

  async findById(id: string): Promise<WorkshopEntity | null> {
    const workshop = await (this.prisma as any).workshop.findUnique({
      where: { id },
      include: {
        app_user_workshop_creatorIdToapp_user: {
          include: {
            user: true,
          },
        },
        app_user_workshop_apprenticeIdToapp_user: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
    if (!workshop) return null;
    return {
      ...workshop,
      creator: workshop.app_user_workshop_creatorIdToapp_user,
      apprentice: workshop.app_user_workshop_apprenticeIdToapp_user,
    } as WorkshopEntity;
  }

  async findByCreatorId(creatorId: string): Promise<WorkshopEntity[]> {
    const workshops = await (this.prisma as any).workshop.findMany({
      where: { creatorId },
      include: {
        app_user_workshop_apprenticeIdToapp_user: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return workshops.map((w: any) => ({
      ...w,
      apprentice: w.app_user_workshop_apprenticeIdToapp_user,
    })) as WorkshopEntity[];
  }

  async findByApprenticeId(apprenticeId: string): Promise<WorkshopEntity[]> {
    const workshops = await (this.prisma as any).workshop.findMany({
      where: { apprenticeId },
      include: {
        app_user_workshop_creatorIdToapp_user: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { date: "asc" },
    });
    return workshops.map((w: any) => ({
      ...w,
      creator: w.app_user_workshop_creatorIdToapp_user,
    })) as WorkshopEntity[];
  }

  async findPublished(): Promise<WorkshopEntity[]> {
    const workshops = await (this.prisma as any).workshop.findMany({
      where: {
        status: "PUBLISHED",
      },
      include: {
        app_user_workshop_creatorIdToapp_user: {
          include: {
            user: true,
          },
        },
        app_user_workshop_apprenticeIdToapp_user: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { date: "asc" },
    });
    return workshops.map((w: any) => ({
      ...w,
      creator: w.app_user_workshop_creatorIdToapp_user,
      apprentice: w.app_user_workshop_apprenticeIdToapp_user,
    })) as WorkshopEntity[];
  }

  async update(
    id: string,
    input: UpdateWorkshopInput
  ): Promise<WorkshopEntity> {
    return (this.prisma as any).workshop.update({
      where: { id },
      data: input,
    });
  }

  async delete(id: string): Promise<void> {
    await (this.prisma as any).workshop.delete({
      where: { id },
    });
  }

  async checkCreatorOwnership(
    workshopId: string,
    creatorId: string
  ): Promise<boolean> {
    const workshop = await (this.prisma as any).workshop.findUnique({
      where: { id: workshopId },
      select: { creatorId: true },
    });
    return workshop?.creatorId === creatorId;
  }

  async removeApprentice(id: string): Promise<void> {
    await (this.prisma as any).workshop.update({
      where: { id },
      data: { apprenticeId: null },
    });
  }

  async findWorkshopBetweenMentorAndApprentice(
    mentorAppUserId: string,
    apprenticeAppUserId: string
  ): Promise<WorkshopEntity | null> {
    const workshop = await (this.prisma as any).workshop.findFirst({
      where: {
        creatorId: mentorAppUserId,
        apprenticeId: apprenticeAppUserId,
        status: {
          in: ["PUBLISHED", "COMPLETED"],
        },
      },
    });

    if (!workshop) return null;

    return {
      id: workshop.id,
      title: workshop.title,
      description: workshop.description,
      topic: workshop.topic,
      date: workshop.date,
      time: workshop.time,
      duration: workshop.duration,
      location: workshop.location,
      isVirtual: workshop.isVirtual,
      maxParticipants: workshop.maxParticipants,
      materialsNeeded: workshop.materialsNeeded,
      status: workshop.status,
      creatorId: workshop.creatorId,
      apprenticeId: workshop.apprenticeId,
      requestId: workshop.requestId,
      createdAt: workshop.createdAt,
      updatedAt: workshop.updatedAt,
      publishedAt: workshop.publishedAt,
      creator: workshop.creator,
      apprentice: workshop.apprentice,
    };
  }
}
