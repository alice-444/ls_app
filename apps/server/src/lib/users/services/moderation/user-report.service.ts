import type {
  IUserReportService,
  CreateReportInput,
} from "./user-report.service.interface";
import type {
  IUserReportRepository,
  ReportReason,
} from "../../repositories/user-report.repository.interface";
import type { AppUserRepository } from "../../repositories";
import type { IAuditLogService } from "../../../common/audit-log.service";
import { Result, success, failure } from "../../../common";
import { handleError, createErrorContext } from "../../../common/error-handler";
import { logger } from "../../../common/logger";

export class UserReportService implements IUserReportService {
  constructor(
    private readonly userReportRepository: IUserReportRepository,
    private readonly appUserRepository: AppUserRepository,
    private readonly auditLogService?: IAuditLogService
  ) {}

  async createReport(
    input: CreateReportInput
  ): Promise<Result<{ reportId: string }>> {
    try {
      if (input.reporterUserId === input.reportedUserId) {
        return failure("Cannot report yourself", 400);
      }

      const reporterAppUser = await this.appUserRepository.findByUserId(
        input.reporterUserId
      );
      if (!reporterAppUser) {
        return failure("Reporter user not found", 404);
      }

      const reportedAppUser = await this.appUserRepository.findByUserId(
        input.reportedUserId
      );
      if (!reportedAppUser) {
        return failure("Reported user not found", 404);
      }

      const report = await this.userReportRepository.create({
        reporterId: reporterAppUser.id,
        reportedId: reportedAppUser.id,
        reason: input.reason,
        details: input.details || null,
        messageId: input.messageId || null,
      });

      logger.info("User report created", {
        reportId: report.id,
        reporterUserId: input.reporterUserId,
        reportedUserId: input.reportedUserId,
        reason: input.reason,
        hasMessageId: !!input.messageId,
      });

      if (this.auditLogService) {
        await this.auditLogService.record(
          input.reporterUserId,
          "USER_REPORTED",
          {
            reportId: report.id,
            reportedUserId: input.reportedUserId,
            reason: input.reason,
            hasDetails: !!input.details,
            messageId: input.messageId || null,
            reporterAppUserId: reporterAppUser.id,
            reportedAppUserId: reportedAppUser.id,
          }
        );
      }

      return success({ reportId: report.id });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("createReport", {
          userId: input.reporterUserId,
          details: { reportedUserId: input.reportedUserId },
        })
      );
    }
  }

  async getReportsByReporter(reporterUserId: string): Promise<
    Result<
      Array<{
        id: string;
        reportedUserId: string;
        reason: ReportReason;
        details: string | null;
        status: string;
        createdAt: Date;
      }>
    >
  > {
    try {
      const reporterAppUser = await this.appUserRepository.findByUserId(
        reporterUserId
      );
      if (!reporterAppUser) {
        return failure("User not found", 404);
      }

      const reports = await this.userReportRepository.findByReporter(
        reporterAppUser.id
      );

      const reportsWithUserIds = await Promise.all(
        reports.map(async (report) => {
          const reportedAppUser = await this.appUserRepository.findByAppUserId(
            report.reportedId
          );
          return {
            id: report.id,
            reportedUserId: reportedAppUser?.userId || report.reportedId,
            reason: report.reason,
            details: report.details,
            status: report.status,
            createdAt: report.createdAt,
          };
        })
      );

      return success(reportsWithUserIds);
    } catch (error) {
      return handleError(
        error,
        createErrorContext("getReportsByReporter", {
          userId: reporterUserId,
        })
      );
    }
  }
}
