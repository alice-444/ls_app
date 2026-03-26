export type ReportStatus = "PENDING" | "REVIEWED" | "RESOLVED" | "DISMISSED";

export type ReportReason =
  | "HARASSMENT"
  | "SPAM"
  | "INAPPROPRIATE_CONTENT"
  | "FAKE_PROFILE";

export interface UserReport {
  id: string;
  reporterUserId: string;
  reportedUserId: string;
  reporterName: string | null;
  reportedName: string | null;
  reason: ReportReason;
  details: string | null;
  status: ReportStatus;
  adminNotes: string | null;
  messageId: string | null;
  reviewedByUserId: string | null;
  reviewedAt: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}
