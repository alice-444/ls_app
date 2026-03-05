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
    return this.prisma.workshop.create({
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
    const workshop = await this.prisma.workshop.findUnique({
      where: { id },
      include: {
        creator: true,
        apprentice: true,
      },
    });
    if (!workshop) return null;
    return this.mapToEntity(workshop);
  }

  async findByCreatorId(
    creatorId: string,
    status?: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED"
  ): Promise<WorkshopEntity[]> {
    const workshops = await this.prisma.workshop.findMany({
      where: {
        creatorId,
        ...(status ? { status } : {}),
      },
      include: {
        creator: true,
        apprentice: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return workshops.map((w: any) => this.mapToEntity(w));
  }

  async findByApprenticeId(apprenticeId: string): Promise<WorkshopEntity[]> {
    const workshops = await this.prisma.workshop.findMany({
      where: { apprenticeId },
      include: {
        creator: true,
        apprentice: true,
      },
      orderBy: { date: "asc" },
    });
    return workshops.map((w: any) => this.mapToEntity(w));
  }

  async findPublished(): Promise<WorkshopEntity[]> {
    const workshops = await this.prisma.workshop.findMany({
      where: {
        status: "PUBLISHED",
      },
      include: {
        creator: true,
        apprentice: true,
      },
      orderBy: { date: "asc" },
    });
    return workshops.map((w: any) => this.mapToEntity(w));
  }

  async update(
    id: string,
    input: UpdateWorkshopInput,
    tx?: any
  ): Promise<WorkshopEntity> {
    const client = tx || this.prisma;
    const workshop = await client.workshop.update({
      where: { id },
      data: input,
      include: {
        creator: true,
        apprentice: true,
      },
    });
    return this.mapToEntity(workshop);
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

  async removeApprentice(id: string, tx?: any): Promise<void> {
    const client = tx || this.prisma;
    await client.workshop.update({
      where: { id },
      data: { apprenticeId: null },
    });
  }

  async findWorkshopBetweenMentorAndApprentice(
    mentorAppUserId: string,
    apprenticeAppUserId: string
  ): Promise<WorkshopEntity | null> {
    const workshop = await this.prisma.workshop.findFirst({
      where: {
        creatorId: mentorAppUserId,
        apprenticeId: apprenticeAppUserId,
        status: {
          in: ["PUBLISHED", "COMPLETED"],
        },
      },
      include: {
        creator: true,
        apprentice: true,
      },
    });

    if (!workshop) return null;
    return this.mapToEntity(workshop);
  }

  private mapToEntity(workshop: any): WorkshopEntity {
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
      apprenticeAttendanceStatus: workshop.apprenticeAttendanceStatus,
      requestId: workshop.requestId,
      createdAt: workshop.createdAt,
      updatedAt: workshop.updatedAt,
      publishedAt: workshop.publishedAt,
      dailyRoomId: workshop.dailyRoomId,
      dailyRoomLastActivityAt: workshop.dailyRoomLastActivityAt,
      creator: workshop.creator,
      apprentice: workshop.apprentice,
    };
  }
}
