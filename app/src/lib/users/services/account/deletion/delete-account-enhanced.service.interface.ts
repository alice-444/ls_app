import type { Result } from "../../../../common";

export interface DeletionEligibility {
  canDelete: boolean;
  reason?: string;
}

export interface IDeleteAccountEnhancedService {
  checkCanDeleteAccount(userId: string): Promise<Result<DeletionEligibility>>;

  initiateDeletion(
    userId: string,
    reason?: string,
  ): Promise<Result<{ success: boolean }>>;

  scrubPII(userId: string): Promise<Result<{ success: boolean }>>;
}
