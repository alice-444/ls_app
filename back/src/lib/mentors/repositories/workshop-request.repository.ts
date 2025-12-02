import type {
  IWorkshopRequestRepository,
  WorkshopRequestEntity,
  CreateWorkshopRequestInput,
  UpdateWorkshopRequestInput,
} from "./workshop-request.repository.interface";

export class PrismaWorkshopRequestRepository
  implements IWorkshopRequestRepository
{
  constructor(private readonly prisma: any) {}

  async create(
    input: CreateWorkshopRequestInput
  ): Promise<WorkshopRequestEntity> {
    const now = new Date();
    const workshopRequest = await (this.prisma as any).workshop_request.create({
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
      include: {
        app_user_workshop_request_apprenticeIdToapp_user: {
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
        app_user_workshop_request_mentorIdToapp_user: {
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

    return {
      ...workshopRequest,
      apprentice:
        workshopRequest.app_user_workshop_request_apprenticeIdToapp_user,
      mentor: workshopRequest.app_user_workshop_request_mentorIdToapp_user,
    } as WorkshopRequestEntity;
  }

  async findById(id: string): Promise<WorkshopRequestEntity | null> {
    const workshopRequest = await (
      this.prisma as any
    ).workshop_request.findUnique({
      where: { id },
      include: {
        app_user_workshop_request_apprenticeIdToapp_user: {
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
        app_user_workshop_request_mentorIdToapp_user: {
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

    if (!workshopRequest) return null;
    return {
      ...workshopRequest,
      apprentice:
        workshopRequest.app_user_workshop_request_apprenticeIdToapp_user,
      mentor: workshopRequest.app_user_workshop_request_mentorIdToapp_user,
    } as WorkshopRequestEntity;
  }

  async findByIdWithLock(
    id: string,
    tx?: any
  ): Promise<WorkshopRequestEntity | null> {
    const prismaClient = tx || this.prisma;

    const fullRequest = await (prismaClient as any).workshop_request.findFirst({
      where: { id },
      include: {
        app_user_workshop_request_apprenticeIdToapp_user: {
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
        app_user_workshop_request_mentorIdToapp_user: {
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

    if (!fullRequest) return null;
    return {
      ...fullRequest,
      apprentice: fullRequest.app_user_workshop_request_apprenticeIdToapp_user,
      mentor: fullRequest.app_user_workshop_request_mentorIdToapp_user,
    } as WorkshopRequestEntity;
  }

  async findByApprenticeId(
    apprenticeId: string
  ): Promise<WorkshopRequestEntity[]> {
    const workshopRequests = await (
      this.prisma as any
    ).workshop_request.findMany({
      where: { apprenticeId },
      include: {
        app_user_workshop_request_apprenticeIdToapp_user: {
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
        app_user_workshop_request_mentorIdToapp_user: {
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

    return workshopRequests.map((wr: any) => ({
      ...wr,
      apprentice: wr.app_user_workshop_request_apprenticeIdToapp_user,
      mentor: wr.app_user_workshop_request_mentorIdToapp_user,
    })) as WorkshopRequestEntity[];
  }

  async findByMentorId(mentorId: string): Promise<WorkshopRequestEntity[]> {
    const workshopRequests = await (
      this.prisma as any
    ).workshop_request.findMany({
      where: { mentorId },
      include: {
        app_user_workshop_request_apprenticeIdToapp_user: {
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
        app_user_workshop_request_mentorIdToapp_user: {
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

    return workshopRequests.map((wr: any) => ({
      ...wr,
      apprentice: wr.app_user_workshop_request_apprenticeIdToapp_user,
      mentor: wr.app_user_workshop_request_mentorIdToapp_user,
    })) as WorkshopRequestEntity[];
  }

  async findByWorkshopId(workshopId: string): Promise<WorkshopRequestEntity[]> {
    const workshopRequests = await (
      this.prisma as any
    ).workshop_request.findMany({
      where: { workshopId },
      include: {
        app_user_workshop_request_apprenticeIdToapp_user: {
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
        app_user_workshop_request_mentorIdToapp_user: {
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

    return workshopRequests.map((wr: any) => ({
      ...wr,
      apprentice: wr.app_user_workshop_request_apprenticeIdToapp_user,
      mentor: wr.app_user_workshop_request_mentorIdToapp_user,
    })) as WorkshopRequestEntity[];
  }

  async countAcceptedByWorkshopId(
    workshopId: string,
    tx?: any
  ): Promise<number> {
    const prismaClient = tx || this.prisma;
    const count = await (prismaClient as any).workshop_request.count({
      where: {
        workshopId,
        status: "ACCEPTED",
      },
    });
    return count;
  }

  async update(
    id: string,
    input: UpdateWorkshopRequestInput
  ): Promise<WorkshopRequestEntity> {
    const workshopRequest = await (this.prisma as any).workshop_request.update({
      where: { id },
      data: {
        ...input,
        updatedAt: new Date(),
      },
      include: {
        app_user_workshop_request_apprenticeIdToapp_user: {
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
        app_user_workshop_request_mentorIdToapp_user: {
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

    return {
      ...workshopRequest,
      apprentice:
        workshopRequest.app_user_workshop_request_apprenticeIdToapp_user,
      mentor: workshopRequest.app_user_workshop_request_mentorIdToapp_user,
    } as WorkshopRequestEntity;
  }

  async updateWithTransaction(
    id: string,
    input: UpdateWorkshopRequestInput,
    tx: any
  ): Promise<WorkshopRequestEntity> {
    const workshopRequest = await (tx as any).workshop_request.update({
      where: { id },
      data: {
        ...input,
        updatedAt: new Date(),
      },
      include: {
        app_user_workshop_request_apprenticeIdToapp_user: {
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
        app_user_workshop_request_mentorIdToapp_user: {
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

    return {
      ...workshopRequest,
      apprentice:
        workshopRequest.app_user_workshop_request_apprenticeIdToapp_user,
      mentor: workshopRequest.app_user_workshop_request_mentorIdToapp_user,
    } as WorkshopRequestEntity;
  }
}
