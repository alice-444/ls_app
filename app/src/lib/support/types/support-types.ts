export enum SupportRequestStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
}

export type SupportRequestStatusType = 
  | "PENDING"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED";