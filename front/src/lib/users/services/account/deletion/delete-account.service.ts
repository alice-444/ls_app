import { AuditLogRepository, JobQueue, AppUserRepository, AuthUserRepository, SessionRepository, AccountRepository, DeletionPlan } from "./delete-account.types";

export class DeleteUserAccountService {
  constructor(
    private readonly prisma: any,
    private readonly repos: {
      appUsers: AppUserRepository;
      authUsers: AuthUserRepository;
      sessions: SessionRepository;
      accounts: AccountRepository;
      audit: AuditLogRepository;
      jobs: JobQueue;
    },
  ) {}

  async execute(plan: DeletionPlan): Promise<void> {
    await this.prisma.$transaction(async () => {
      if (plan.softDeleteAppUserNow) {
        await this.repos.appUsers.softDelete(plan.userId, new Date(), plan.reason);
      }
      if (plan.disableAuthUserNow) {
        await this.repos.authUsers.disable(plan.userId, new Date());
      }
      if (plan.revokeSessions) {
        await this.repos.sessions.deleteAllByUserId(plan.userId);
      }
      if (plan.unlinkAccounts) {
        await this.repos.accounts.unlinkAllByUserId(plan.userId);
      }
      for (const e of plan.auditEvents) {
        await this.repos.audit.record(plan.userId, e.type, e.meta);
      }
      if (plan.enqueueHardPurgeAt) {
        await this.repos.jobs.enqueueHardPurge(plan.userId, plan.enqueueHardPurgeAt);
      }
    });
  }
}
