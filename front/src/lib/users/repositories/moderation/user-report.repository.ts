import type {
  IUserReportRepository,
  UserReportEntity,
  CreateUserReportInput,
  ReportStatus,
} from "./user-report.repository.interface";
import { generateInternalId } from "../../../utils/id-generator";
import type { PrismaClient } from '@/lib/prisma-server';

export class PrismaUserReportRepository implements IUserReportRepository {
  constructor(private readonly prisma: PrismaClient) {}
  
  async create(input: CreateUserReportInput): Promise<UserReportEntity> {
    const report = await this.prisma.user_report.create({
      data: {
        id: generateInternalId(),
        reporterUserId: input.reporterId,
        reportedUserId: input.reportedId,
        reason: input.reason,
        details: input.details || null,
        messageId: input.messageId || null,
        status: "PENDING",
      },
    });

    return this.mapToEntity(report);
  }

  async findById(id: string): Promise<UserReportEntity | null> {
    const report = await this.prisma.user_report.findUnique({
      where: { id },
    });

    if (!report) return null;

    return this.mapToEntity(report);
  }

  async findByReporter(reporterId: string): Promise<UserReportEntity[]> {
    const reports = await this.prisma.user_report.findMany({
      where: { reporterUserId: reporterId },
      orderBy: { createdAt: "desc" },
    });

    return reports.map((report: any) => this.mapToEntity(report));
  }

  async findByReported(reportedId: string): Promise<UserReportEntity[]> {
    const reports = await this.prisma.user_report.findMany({
      where: { reportedUserId: reportedId },
      orderBy: { createdAt: "desc" },
    });

    return reports.map((report: any) => this.mapToEntity(report));
  }

  async findByStatus(status: ReportStatus): Promise<UserReportEntity[]> {
    const reports = await this.prisma.user_report.findMany({
      where: { status },
      orderBy: { createdAt: "desc" },
    });

    return reports.map((report: any) => this.mapToEntity(report));
  }

  async updateStatus(
    id: string,
    status: ReportStatus,
    reviewedById?: string | null,
    adminNotes?: string | null
  ): Promise<UserReportEntity> {
    const report = await this.prisma.user_report.update({
      where: { id },
      data: { 
        status, 
        reviewedById,
        adminNotes,
        reviewedAt: new Date(),
        updatedAt: new Date() 
      },
    });

    return this.mapToEntity(report);
  }

  async findMany(params?: {
    skip?: number;
    take?: number;
    where?: any;
    orderBy?: any;
    include?: any;
  }): Promise<any[]> {
    return this.prisma.user_report.findMany(params);
  }

  async update(params: {
    where: { id: string };
    data: any;
  }): Promise<any> {
    return this.prisma.user_report.update(params);
  }

  private mapToEntity(report: any): UserReportEntity {
    return {
      id: report.id,
      reporterId: report.reporterUserId,
      reportedId: report.reportedUserId,
      reason: report.reason,
      details: report.details,
      messageId: report.messageId,
      status: report.status,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      reviewedAt: report.reviewedAt,
      reviewedBy: report.reviewedById,
      adminNotes: report.adminNotes,
    };
  }
}
