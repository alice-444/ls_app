import type {
  PrismaClient,
  support_request,
} from '@/lib/prisma-server';
import {
  ISupportRequestRepository,
  CreateSupportRequestInput,
  UpdateSupportRequestInput,
} from "./support-request.repository.interface";

export class PrismaSupportRequestRepository implements ISupportRequestRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateSupportRequestInput): Promise<support_request> {
    return this.prisma.support_request.create({ data });
  }

  async findById(id: string): Promise<support_request | null> {
    return this.prisma.support_request.findUnique({ where: { id } });
  }

  async findMany(params?: {
    skip?: number;
    take?: number;
    where?: any;
    orderBy?: any;
    include?: any;
  }): Promise<support_request[]> {
    return this.prisma.support_request.findMany(params);
  }

  async count(where?: any): Promise<number> {
    return this.prisma.support_request.count({ where });
  }

  async update(id: string, data: UpdateSupportRequestInput): Promise<support_request> {
    return this.prisma.support_request.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });
  }
}
