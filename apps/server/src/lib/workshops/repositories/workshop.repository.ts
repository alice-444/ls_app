import type {
  IWorkshopRepository,
  CreateWorkshopInput,
  UpdateWorkshopInput,
  WorkshopEntity,
} from "./workshop.repository.interface";

export class PrismaWorkshopRepository implements IWorkshopRepository {
  constructor(private readonly prisma: any) {}
  async create(input: CreateWorkshopInput): Promise<WorkshopEntity> {
    return this.prisma.workshop.create({
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
      },
    });
  }

  async findById(id: string): Promise<WorkshopEntity | null> {
    return this.prisma.workshop.findUnique({
      where: { id },
      include: {
        creator: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async findByCreatorId(creatorId: string): Promise<WorkshopEntity[]> {
    return this.prisma.workshop.findMany({
      where: { creatorId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findPublished(): Promise<WorkshopEntity[]> {
    return this.prisma.workshop.findMany({
      where: {
        status: "PUBLISHED",
      },
      include: {
        creator: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { date: "asc" },
    });
  }

  async update(id: string, input: UpdateWorkshopInput): Promise<WorkshopEntity> {
    return this.prisma.workshop.update({
      where: { id },
      data: input,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.workshop.delete({
      where: { id },
    });
  }

  async checkCreatorOwnership(
    workshopId: string,
    creatorId: string
  ): Promise<boolean> {
    const workshop = await this.prisma.workshop.findUnique({
      where: { id: workshopId },
      select: { creatorId: true },
    });
    return workshop?.creatorId === creatorId;
  }
}

