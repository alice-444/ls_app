import type {
  IWorkshopRepository,
  CreateWorkshopInput,
  UpdateWorkshopInput,
  WorkshopEntity,
} from "./workshop.repository.interface";

export class PrismaWorkshopRepository implements IWorkshopRepository {
  constructor(private readonly prisma: any) {}
  async create(input: CreateWorkshopInput): Promise<WorkshopEntity> {
    return (this.prisma as any).workshop.create({
      data: {
        id: crypto.randomUUID(),
        title: input.title,
        description: input.description,
        date: input.date,
        time: input.time,
        duration: input.duration,
        location: input.location,
        isVirtual: input.isVirtual ?? false,
        maxParticipants: input.maxParticipants,
        materialsNeeded: input.materialsNeeded,
        creatorId: input.creatorId,
        apprenticeId: input.apprenticeId ?? null,
        requestId: input.requestId ?? null,
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
      },
    });
    if (!workshop) return null;
    return {
      ...workshop,
      creator: workshop.app_user_workshop_creatorIdToapp_user,
    } as WorkshopEntity;
  }

  async findByCreatorId(creatorId: string): Promise<WorkshopEntity[]> {
    return (this.prisma as any).workshop.findMany({
      where: { creatorId },
      orderBy: { createdAt: "desc" },
    });
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
      },
      orderBy: { date: "asc" },
    });
    return workshops.map((w: any) => ({
      ...w,
      creator: w.app_user_workshop_creatorIdToapp_user,
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
}
