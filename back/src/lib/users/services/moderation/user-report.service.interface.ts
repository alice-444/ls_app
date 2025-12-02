import type { Result } from "../../../common";
import type { ReportReason } from "../../repositories/moderation/user-report.repository.interface";

export interface CreateReportInput {
  reporterUserId: string;
  reportedUserId: string;
  reason: ReportReason;
  details?: string | null;
  messageId?: string | null;
}

export interface IUserReportService {
  createReport(input: CreateReportInput): Promise<Result<{ reportId: string }>>;
  getReportsByReporter(reporterUserId: string): Promise<
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
  >;
}
