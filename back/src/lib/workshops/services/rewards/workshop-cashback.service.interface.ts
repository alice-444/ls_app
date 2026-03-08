import type { Result } from "../../../common";

export interface CashbackProcessingDelay {
  transactionId: string;
  workshopId: string;
  participantUserId: string;
  workshopEndTime: Date;
  processedAt: Date;
  delayInMinutes: number;
  delayInHours: number;
}

export interface ProcessedCashbackReport {
  transactionId: string;
  workshopId: string;
  participantUserId: string;
  cashbackAmount: number;
  workshopEndTime: Date;
  processedAt: Date;
  createdAt: Date;
}

export interface DataIntegrityIssue {
  transactionId: string;
  workshopId: string;
  participantUserId: string;
  status: string;
  issue: string;
}

export interface CashbackSummary {
  totalEarned: number;
  byMonth: { month: string; amount: number }[];
}

export interface CashbackItem {
  id: string;
  workshopId: string;
  workshopTitle: string;
  participantUserId: string;
  participantName: string;
  cashbackAmount: number;
  status: string;
  processedAt: Date | null;
  createdAt: Date;
}

export interface IWorkshopCashbackService {
  processCashback(
    workshopId: string,
    participantUserId: string,
    workshopEndTime: Date
  ): Promise<Result<{ queued: boolean; cashbackAmount: number }>>;

  processQueuedCashbacks(): Promise<
    Result<{ processed: number; failed: number }>
  >;

  getProcessingDelays(options?: {
    startDate?: Date;
    endDate?: Date;
    minDelayMinutes?: number;
    maxDelayMinutes?: number;
  }): Promise<Result<CashbackProcessingDelay[]>>;

  getProcessedCashbacksByDate(
    date: Date
  ): Promise<Result<ProcessedCashbackReport[]>>;

  checkDataIntegrity(): Promise<Result<DataIntegrityIssue[]>>;

  retryFailedCashbacks(): Promise<
    Result<{ retried: number; stillFailed: number }>
  >;

  getSummary(
    mentorId: string,
    options?: { from?: Date; to?: Date }
  ): Promise<Result<CashbackSummary>>;

  getHistory(
    mentorId: string,
    options?: { limit?: number; cursor?: string }
  ): Promise<Result<{ items: CashbackItem[]; nextCursor?: string }>>;
}
