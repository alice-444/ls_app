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
}
