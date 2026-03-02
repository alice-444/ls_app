import { PrismaClient, SupportRequest, SupportRequestStatus } from "@prisma/client";
import {
  ISupportRequestRepository,
  CreateSupportRequestInput,
  UpdateSupportRequestInput,
} from "./support-request.repository.interface";

export class PrismaSupportRequestRepository implements ISupportRequestRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateSupportRequestInput): Promise<SupportRequest> {
    return this.prisma.support_request.create({ data: { ...data, id: undefined as any } });
  }

  async findById(id: string): Promise<SupportRequest | null> {
    return this.prisma.support_request.findUnique({ where: { id } });
  }

  async findMany(params?: {
    skip?: number;
    take?: number;
    where?: any;
    orderBy?: any;
    include?: any;
  }): Promise<SupportRequest[]> {
    return this.prisma.support_request.findMany(params);
  }

  async count(where?: any): Promise<number> {
    return this.prisma.support_request.count({ where });
  }

  async update(id: string, data: UpdateSupportRequestInput): Promise<SupportRequest> {
    return this.prisma.support_request.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });
  }
}
