import type { Result } from "../../../../common";

export interface IDeleteAccountEnhancedService {
  checkCanDeleteAccount(
    userId: string
  ): Promise<Result<{ canDelete: boolean; reason?: string }>>;

  initiateDeletion(
    userId: string,
    reason?: string
  ): Promise<Result<{ success: boolean }>>;

  scrubPII(
    userId: string
  ): Promise<Result<{ success: boolean }>>;
}
