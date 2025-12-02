export type ReportReason =
  | "HARASSMENT"
  | "SPAM"
  | "INAPPROPRIATE_CONTENT"
  | "FAKE_PROFILE";
export type ReportStatus = "PENDING" | "REVIEWED" | "RESOLVED" | "DISMISSED";

export interface UserReportEntity {
  id: string;
  reporterId: string;
  reportedId: string;
  reason: ReportReason;
  details: string | null;
  messageId: string | null;
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  adminNotes: string | null;
}

export interface CreateUserReportInput {
  reporterId: string;
  reportedId: string;
  reason: ReportReason;
  details?: string | null;
  messageId?: string | null;
}

export interface IUserReportRepository {
  create(input: CreateUserReportInput): Promise<UserReportEntity>;
  findById(id: string): Promise<UserReportEntity | null>;
  findByReporter(reporterId: string): Promise<UserReportEntity[]>;
  findByReported(reportedId: string): Promise<UserReportEntity[]>;
  findByStatus(status: ReportStatus): Promise<UserReportEntity[]>;
  updateStatus(
    id: string,
    status: ReportStatus,
    reviewedBy?: string | null,
    adminNotes?: string | null
  ): Promise<UserReportEntity>;
}
