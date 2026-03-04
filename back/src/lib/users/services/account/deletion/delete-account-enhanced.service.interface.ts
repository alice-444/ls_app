import { Result } from "../../../../common";

export interface IDeleteAccountEnhancedService {
  checkCanDeleteAccount(
    userId: string
  ): Promise<Result<{ canDelete: boolean; reason?: string }>>;

  scrubPII(
    userId: string
  ): Promise<Result<{ success: boolean }>>;
}
