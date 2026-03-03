import type {
  IWorkshopRequestRepository,
  WorkshopRequestEntity,
  CreateWorkshopRequestInput,
  UpdateWorkshopRequestInput,
} from "./workshop-request.repository.interface";

const WORKSHOP_REQUEST_INCLUDE = {
  user_workshop_request_apprenticeIdTouser: {
    select: { id: true, name: true, email: true, userId: true },
  },
  user_workshop_request_mentorIdTouser: {
    select: { id: true, name: true, email: true, userId: true },
  },
} as const;

function mapToEntity(raw: any): WorkshopRequestEntity {
  return {
    ...raw,
    apprentice: raw.user_workshop_request_apprenticeIdTouser,
    mentor: raw.user_workshop_request_mentorIdTouser,
  } as WorkshopRequestEntity;
}

export class PrismaWorkshopRequestRepository
  implements IWorkshopRequestRepository
{
  constructor(private readonly prisma: any) {}

  async create(
    input: CreateWorkshopRequestInput
  ): Promise<WorkshopRequestEntity> {
    const now = new Date();
    const raw = await (this.prisma as any).workshop_request.create({
      data: {
        id: crypto.randomUUID(),
        title: input.title,
        description: input.description ?? null,
        message: input.message ?? null,
        preferredDate: input.preferredDate ?? null,
        preferredTime: input.preferredTime ?? null,
        apprenticeId: input.apprenticeId,
        mentorId: input.mentorId,
        workshopId: input.workshopId ?? null,
        createdAt: now,
        updatedAt: now,
      },
      include: WORKSHOP_REQUEST_INCLUDE,
    });
    return mapToEntity(raw);
  }

  async findById(id: string): Promise<WorkshopRequestEntity | null> {
    const raw = await (this.prisma as any).workshop_request.findUnique({
      where: { id },
      include: WORKSHOP_REQUEST_INCLUDE,
    });
    if (!raw) return null;
    return mapToEntity(raw);
  }

  async findByIdWithLock(
    id: string,
    tx?: any
  ): Promise<WorkshopRequestEntity | null> {
    const client = tx || this.prisma;
    const raw = await (client as any).workshop_request.findFirst({
      where: { id },
      include: WORKSHOP_REQUEST_INCLUDE,
    });
    if (!raw) return null;
    return mapToEntity(raw);
  }

  async findByApprenticeId(
    apprenticeId: string
  ): Promise<WorkshopRequestEntity[]> {
    const results = await (this.prisma as any).workshop_request.findMany({
      where: { apprenticeId },
      include: WORKSHOP_REQUEST_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
    return results.map(mapToEntity);
  }

  async findByMentorId(mentorId: string): Promise<WorkshopRequestEntity[]> {
    const results = await (this.prisma as any).workshop_request.findMany({
      where: { mentorId },
      include: WORKSHOP_REQUEST_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
    return results.map(mapToEntity);
  }

  async findByWorkshopId(workshopId: string): Promise<WorkshopRequestEntity[]> {
    const results = await (this.prisma as any).workshop_request.findMany({
      where: { workshopId },
      include: WORKSHOP_REQUEST_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
    return results.map(mapToEntity);
  }

  async countAcceptedByWorkshopId(
    workshopId: string,
    tx?: any
  ): Promise<number> {
    const client = tx || this.prisma;
    return (client as any).workshop_request.count({
      where: { workshopId, status: "ACCEPTED" },
    });
  }

  async update(
    id: string,
    input: UpdateWorkshopRequestInput
  ): Promise<WorkshopRequestEntity> {
    const raw = await (this.prisma as any).workshop_request.update({
      where: { id },
      data: { ...input, updatedAt: new Date() },
      include: WORKSHOP_REQUEST_INCLUDE,
    });
    return mapToEntity(raw);
  }

  async updateWithTransaction(
    id: string,
    input: UpdateWorkshopRequestInput,
    tx: any
  ): Promise<WorkshopRequestEntity> {
    const raw = await (tx as any).workshop_request.update({
      where: { id },
      data: { ...input, updatedAt: new Date() },
      include: WORKSHOP_REQUEST_INCLUDE,
    });
    return mapToEntity(raw);
  }
}
