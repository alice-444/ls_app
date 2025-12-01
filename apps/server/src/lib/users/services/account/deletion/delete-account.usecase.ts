import { DeletionPlan, DeletionPolicy } from "./delete-account.types";

export type DomainError =
  | { type: "NOT_AUTHENTICATED" }
  | { type: "APPUSER_NOT_FOUND" }
  | { type: "ALREADY_DELETED" }
  | { type: "REASON_REQUIRED" };

export function computeRetentionDate(now: Date, policy: DeletionPolicy): Date {
  const runAt = new Date(now.getTime());
  runAt.setDate(runAt.getDate() + (policy.retentionDays ?? 0));
  return runAt;
}

export function buildDeletionPlan(params: {
  authUserId: string | null;
  appUserId: string | null;
  policy: DeletionPolicy;
  now: Date;
  reason?: string;
}): { ok: true; plan: DeletionPlan } | { ok: false; error: DomainError } {
  const { authUserId, appUserId, policy, now, reason } = params;
  if (!authUserId) return { ok: false, error: { type: "NOT_AUTHENTICATED" } };
  if (!appUserId) return { ok: false, error: { type: "APPUSER_NOT_FOUND" } };
  if (policy.requireReason && !reason)
    return { ok: false, error: { type: "REASON_REQUIRED" } };

  const plan: DeletionPlan = {
    userId: authUserId,
    appUserId,
    softDeleteAppUserNow: true,
    disableAuthUserNow: true,
    unlinkAccounts: true,
    revokeSessions: true,
    auditEvents: [
      { type: "USER_DELETE_REQUESTED", meta: { at: now.toISOString() } },
    ],
    enqueueHardPurgeAt: computeRetentionDate(now, policy),
    reason,
  };
  return { ok: true, plan };
}
