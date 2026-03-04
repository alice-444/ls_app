export type DeletionPolicy = {
  retentionDays: number;
  requireReason?: boolean;
};

export type DeletionPlan = {
  userId: string; // auth user id
  appUserId: string;
  softDeleteAppUserNow: boolean;
  disableAuthUserNow: boolean;
  unlinkAccounts: boolean;
  revokeSessions: boolean;
  auditEvents: { type: string; meta?: Record<string, unknown> }[];
  enqueueHardPurgeAt?: Date;
  reason?: string;
};

export interface AppUserRepository {
  findByAuthUserId(userId: string): Promise<{ id: string; deletedAt: Date | null } | null>;
  softDelete(userId: string, when: Date, reason?: string): Promise<void>;
  isAlreadyDeleted(userId: string): Promise<boolean>;
}

export interface AuthUserRepository {
  disable(userId: string, when: Date): Promise<void>;
}

export interface SessionRepository {
  deleteAllByUserId(userId: string): Promise<number>;
}

export interface AccountRepository {
  unlinkAllByUserId(userId: string): Promise<number>;
}

export interface AuditLogRepository {
  record(userId: string, type: string, meta?: Record<string, unknown>): Promise<void>;
}

export interface JobQueue {
  enqueueHardPurge(userId: string, runAt: Date): Promise<void>;
}


