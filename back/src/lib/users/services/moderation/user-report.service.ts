import type {
  IUserReportService,
  CreateReportInput,
} from "./user-report.service.interface";
import type {
  IUserReportRepository,
  ReportReason,
} from "../../repositories/moderation/user-report.repository.interface";
import type { AppUserRepository } from "../../repositories";
import type { IAuditLogService } from "../../../common/audit-log.service";
import { failure, success, Result } from "@/lib/common/types";
import { logger } from "../../../common/logger";
import { handleError, createErrorContext } from "../../../common/error-handler";
import type { INotificationService } from "../../../notifications/services/notification.service.interface";

export class UserReportService implements IUserReportService {
  constructor(
    private readonly userReportRepository: IUserReportRepository,
    private readonly appUserRepository: AppUserRepository,
    private readonly auditLogService?: IAuditLogService,
    private readonly notificationService?: INotificationService
  ) {}

  async createReport(input: CreateReportInput): Promise<Result<{ reportId: string }>> {
    const { reporterUserId, reportedUserId, reason, details, messageId } = input;

    if (reporterUserId === reportedUserId) {
      return failure("Vous ne pouvez pas vous signaler vous-même", 400);
    }

    try {
      const reporter = await this.appUserRepository.findByUserId(reporterUserId);
      if (!reporter) return failure("Utilisateur (rapporteur) introuvable", 404);

      const reported = await this.appUserRepository.findByUserId(reportedUserId);
      if (!reported) return failure("Utilisateur (signalé) introuvable", 404);

      const report = await this.userReportRepository.create({
        reporterId: reporter.id,
        reportedId: reported.id,
        reason: reason as ReportReason,
        details: details || null,
        messageId: messageId || null,
      });

      logger.info("User report created", {
        reportId: report.id,
        reporterUserId,
        reportedUserId,
        reason,
        hasMessageId: !!messageId,
      });

      if (this.auditLogService) {
        await this.auditLogService.record(reporterUserId, "USER_REPORTED", {
          reportId: report.id,
          reportedUserId,
          reason,
        });
      }

      if (this.notificationService) {
        const reporterName = await this.appUserRepository.findUserNameByUserId(reporterUserId);
        const reportedName = await this.appUserRepository.findUserNameByUserId(reportedUserId);
        
        await this.notificationService.notifyAdmin(
          "NEW_REPORT",
          `Nouveau signalement de ${reporterName || reporterUserId} contre ${reportedName || reportedUserId} : ${reason}`,
          `/admin/reports?id=${report.id}`
        );
      }

      return success({ reportId: report.id });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("createReport", {
          userId: reporterUserId,
          details: { reportedUserId },
        })
      );
    }
  }

  async getReportsByReporter(userId: string): Promise<Result<any[]>> {
    try {
      const appUser = await this.appUserRepository.findByUserId(userId);
      if (!appUser) return failure("Utilisateur introuvable", 404);

      const reports = await this.userReportRepository.findByReporter(appUser.id);

      const reportsWithUserIds = await Promise.all(
        reports.map(async (report) => {
          const reportedAppUser = await this.appUserRepository.findByAppUserId(report.reportedId);
          return {
            ...report,
            reportedUserId: reportedAppUser?.userId || report.reportedId,
          };
        })
      );

      return success(reportsWithUserIds);
    } catch (error) {
      return handleError(error, createErrorContext("getReportsByReporter", { userId }));
    }
  }

  async getAdminReportQueue(params?: { limit?: number; offset?: number }): Promise<Result<any[]>> {
    try {
      const reports = await this.userReportRepository.findMany({
        take: params?.limit || 50,
        skip: params?.offset || 0,
        orderBy: { createdAt: "desc" },
      });

      const enrichedReports = await Promise.all(
        reports.map(async (report) => {
          const [reporter, reported] = await Promise.all([
            this.appUserRepository.findByAppUserId(report.reporterUserId),
            this.appUserRepository.findByAppUserId(report.reportedUserId),
          ]);

          return {
            ...report,
            reporterUserId: reporter?.userId,
            reportedUserId: reported?.userId,
            reporterName: reporter?.name,
            reportedName: reported?.name,
          };
        })
      );

      return success(enrichedReports);
    } catch (error) {
      return handleError(error, createErrorContext("getAdminReportQueue"));
    }
  }

  async reviewReport(reportId: string, status: "RESOLVED" | "DISMISSED", adminNotes?: string): Promise<Result<{ success: boolean }>> {
    try {
      await this.userReportRepository.update({
        where: { id: reportId },
        data: {
          status,
          adminNotes: adminNotes || null,
          updatedAt: new Date(),
        },
      });

      logger.info("Report reviewed", { reportId, status });

      return success({ success: true });
    } catch (error) {
      return handleError(error, createErrorContext("reviewReport", { resourceId: reportId }));
    }
  }

  async updateReportStatus(reportId: string, status: any, adminNotes?: string): Promise<any> {
    return this.userReportRepository.update({
      where: { id: reportId },
      data: {
        status,
        adminNotes: adminNotes || null,
        reviewedAt: new Date(),
      },
    });
  }
}
