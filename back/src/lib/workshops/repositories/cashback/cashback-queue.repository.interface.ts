export type CashbackStatus = "PENDING" | "PROCESSED" | "FAILED";

export interface CashbackQueueEntity {
  id: string;
  workshopId: string;
  participantUserId: string;
  cashbackAmount: number;
  workshopEndTime: Date;
  status: CashbackStatus;
  processedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  retryCount: number;
  errorMessage: string | null;
  lastRetryAt: Date | null;
}

export interface CreateCashbackQueueInput {
  id: string;
  workshopId: string;
  participantUserId: string;
  cashbackAmount: number;
  workshopEndTime: Date;
  status?: CashbackStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UpdateCashbackQueueInput {
  status?: CashbackStatus;
  processedAt?: Date | null;
  retryCount?: number;
  errorMessage?: string | null;
  lastRetryAt?: Date | null;
  updatedAt?: Date;
}

export interface ICashbackQueueRepository {
  findFirstByWorkshopAndUser(
    workshopId: string,
    participantUserId: string
  ): Promise<CashbackQueueEntity | null>;

  findPendingDue(
    now: Date,
    retryDelayMinutes: number
  ): Promise<CashbackQueueEntity[]>;

  findFailedRetriable(
    maxRetries: number,
    retryDelayMinutes: number
  ): Promise<CashbackQueueEntity[]>;

  findProcessedWithProcessedAt(
    startDate?: Date,
    endDate?: Date
  ): Promise<CashbackQueueEntity[]>;

  findProcessedByDate(date: Date): Promise<CashbackQueueEntity[]>;

  findProcessedWithoutProcessedAt(): Promise<CashbackQueueEntity[]>;

  findNonProcessedWithProcessedAt(): Promise<CashbackQueueEntity[]>;

  create(input: CreateCashbackQueueInput): Promise<CashbackQueueEntity>;

  update(
    id: string,
    input: UpdateCashbackQueueInput
  ): Promise<CashbackQueueEntity>;

  findSummaryByMentor(
    mentorId: string,
    from?: Date,
    to?: Date
  ): Promise<{ totalEarned: number; byMonth: { month: string; amount: number }[] }>;

  findHistoryByMentor(
    mentorId: string,
    options?: { limit?: number; cursor?: string }
  ): Promise<{ items: (CashbackQueueEntity & { workshopTitle: string; participantName: string })[]; nextCursor?: string }>;
}
