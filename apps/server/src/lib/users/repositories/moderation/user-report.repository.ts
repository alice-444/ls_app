import type {
  IUserReportRepository,
  UserReportEntity,
  CreateUserReportInput,
  ReportStatus,
} from "./user-report.repository.interface";
import { generateInternalId } from "../../../utils/id-generator";
import { prisma } from "../../../common";

export class PrismaUserReportRepository implements IUserReportRepository {
  async create(input: CreateUserReportInput): Promise<UserReportEntity> {
    const report = await (prisma as any).user_report.create({
      data: {
        id: generateInternalId(),
        reporterId: input.reporterId,
        reportedId: input.reportedId,
        reason: input.reason,
        details: input.details || null,
        messageId: input.messageId || null,
        status: "PENDING",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return this.mapToEntity(report);
  }

  async findById(id: string): Promise<UserReportEntity | null> {
    const report = await (prisma as any).user_report.findUnique({
      where: { id },
    });

    if (!report) return null;

    return this.mapToEntity(report);
  }

  async findByReporter(reporterId: string): Promise<UserReportEntity[]> {
    const reports = await (prisma as any).user_report.findMany({
      where: { reporterId },
      orderBy: { createdAt: "desc" },
    });

    return reports.map((report: any) => this.mapToEntity(report));
  }

  async findByReported(reportedId: string): Promise<UserReportEntity[]> {
    const reports = await (prisma as any).user_report.findMany({
      where: { reportedId },
      orderBy: { createdAt: "desc" },
    });

    return reports.map((report: any) => this.mapToEntity(report));
  }

  async findByStatus(status: ReportStatus): Promise<UserReportEntity[]> {
    const reports = await (prisma as any).user_report.findMany({
      where: { status },
      orderBy: { createdAt: "desc" },
    });

    return reports.map((report: any) => this.mapToEntity(report));
  }

  async updateStatus(
    id: string,
    status: ReportStatus,
    reviewedBy?: string | null,
    adminNotes?: string | null
  ): Promise<UserReportEntity> {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (status !== "PENDING") {
      updateData.reviewedAt = new Date();
      if (reviewedBy) {
        updateData.reviewedBy = reviewedBy;
      }
    }

    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }

    const report = await (prisma as any).user_report.update({
      where: { id },
      data: updateData,
    });

    return this.mapToEntity(report);
  }

  private mapToEntity(report: any): UserReportEntity {
    return {
      id: report.id,
      reporterId: report.reporterId,
      reportedId: report.reportedId,
      reason: report.reason,
      details: report.details,
      messageId: report.messageId,
      status: report.status,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      reviewedAt: report.reviewedAt,
      reviewedBy: report.reviewedBy,
      adminNotes: report.adminNotes,
    };
  }
}
