import type { Result } from "../../../../common";

export interface SignInEmailInput {
  email: string;
  password: string;
}

export interface BetterAuthChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  revokeOtherSessions?: boolean;
}

export interface IAuthService {
  verifyCredentials(
    input: SignInEmailInput
  ): Promise<Result<{ userId: string }>>;
  changePassword(
    input: BetterAuthChangePasswordInput
  ): Promise<Result<{ success: boolean }>>;
}
