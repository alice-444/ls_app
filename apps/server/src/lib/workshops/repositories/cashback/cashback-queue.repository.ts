import type {
  ICashbackQueueRepository,
  CashbackQueueEntity,
  CreateCashbackQueueInput,
  UpdateCashbackQueueInput,
  CashbackStatus,
} from "./cashback-queue.repository.interface";
import type { PrismaClient } from "../../../../../prisma/generated/client/client";

export class PrismaCashbackQueueRepository implements ICashbackQueueRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findFirstByWorkshopAndUser(
    workshopId: string,
    participantUserId: string
  ): Promise<CashbackQueueEntity | null> {
    const queue = await (this.prisma as any).workshop_cashback_queue.findFirst({
      where: {
        workshopId,
        participantUserId,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!queue) return null;

    return this.mapToEntity(queue);
  }

  async findPendingDue(
    now: Date,
    retryDelayMinutes: number
  ): Promise<CashbackQueueEntity[]> {
    const retryDelayMs = retryDelayMinutes * 60 * 1000;
    const retryDelayThreshold = new Date(now.getTime() - retryDelayMs);

    const queues = await (this.prisma as any).workshop_cashback_queue.findMany({
      where: {
        status: "PENDING",
        workshopEndTime: {
          lte: now,
        },
        OR: [
          { lastRetryAt: null },
          { lastRetryAt: { lte: retryDelayThreshold } },
        ],
      },
    });

    return queues.map((q: any) => this.mapToEntity(q));
  }

  async findFailedRetriable(
    maxRetries: number,
    retryDelayMinutes: number
  ): Promise<CashbackQueueEntity[]> {
    const now = new Date();
    const retryDelayMs = retryDelayMinutes * 60 * 1000;
    const retryDelayThreshold = new Date(now.getTime() - retryDelayMs);

    const queues = await (this.prisma as any).workshop_cashback_queue.findMany({
      where: {
        status: "FAILED",
        retryCount: {
          lt: maxRetries,
        },
        OR: [
          { lastRetryAt: null },
          { lastRetryAt: { lte: retryDelayThreshold } },
        ],
      },
    });

    return queues.map((q: any) => this.mapToEntity(q));
  }

  async findProcessedWithProcessedAt(
    startDate?: Date,
    endDate?: Date
  ): Promise<CashbackQueueEntity[]> {
    const where: any = {
      status: "PROCESSED",
      processedAt: { not: null },
    };

    if (startDate) {
      where.processedAt = { ...where.processedAt, gte: startDate };
    }
    if (endDate) {
      where.processedAt = { ...where.processedAt, lte: endDate };
    }

    const queues = await (this.prisma as any).workshop_cashback_queue.findMany({
      where,
    });

    return queues.map((q: any) => this.mapToEntity(q));
  }

  async findProcessedByDate(date: Date): Promise<CashbackQueueEntity[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const queues = await (this.prisma as any).workshop_cashback_queue.findMany({
      where: {
        status: "PROCESSED",
        processedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    return queues.map((q: any) => this.mapToEntity(q));
  }

  async findProcessedWithoutProcessedAt(): Promise<CashbackQueueEntity[]> {
    const queues = await (this.prisma as any).workshop_cashback_queue.findMany({
      where: {
        status: "PROCESSED",
        processedAt: null,
      },
    });

    return queues.map((q: any) => this.mapToEntity(q));
  }

  async findNonProcessedWithProcessedAt(): Promise<CashbackQueueEntity[]> {
    const queues = await (this.prisma as any).workshop_cashback_queue.findMany({
      where: {
        status: { in: ["PENDING", "FAILED"] },
        processedAt: { not: null },
      },
    });

    return queues.map((q: any) => this.mapToEntity(q));
  }

  async create(input: CreateCashbackQueueInput): Promise<CashbackQueueEntity> {
    const queue = await (this.prisma as any).workshop_cashback_queue.create({
      data: {
        id: input.id,
        workshopId: input.workshopId,
        participantUserId: input.participantUserId,
        cashbackAmount: input.cashbackAmount,
        workshopEndTime: input.workshopEndTime,
        status: input.status || "PENDING",
        createdAt: input.createdAt || new Date(),
        updatedAt: input.updatedAt || new Date(),
      },
    });

    return this.mapToEntity(queue);
  }

  async update(
    id: string,
    input: UpdateCashbackQueueInput
  ): Promise<CashbackQueueEntity> {
    const queue = await (this.prisma as any).workshop_cashback_queue.update({
      where: { id },
      data: {
        ...input,
        updatedAt: input.updatedAt || new Date(),
      },
    });

    return this.mapToEntity(queue);
  }

  private mapToEntity(queue: any): CashbackQueueEntity {
    return {
      id: queue.id,
      workshopId: queue.workshopId,
      participantUserId: queue.participantUserId,
      cashbackAmount: queue.cashbackAmount,
      workshopEndTime: queue.workshopEndTime,
      status: queue.status as CashbackStatus,
      processedAt: queue.processedAt,
      createdAt: queue.createdAt,
      updatedAt: queue.updatedAt,
      retryCount: queue.retryCount || 0,
      errorMessage: queue.errorMessage,
      lastRetryAt: queue.lastRetryAt,
    };
  }
}
