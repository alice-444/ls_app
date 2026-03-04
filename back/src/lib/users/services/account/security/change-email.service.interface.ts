import type { Result } from "../../../../common";

export interface ChangeEmailInput {
  newEmail: string;
  currentPassword: string;
}

export interface IChangeEmailService {
  requestEmailChange(
    userId: string,
    input: ChangeEmailInput
  ): Promise<Result<{ success: boolean; message: string }>>;

  verifyEmailChange(token: string): Promise<Result<{ success: boolean }>>;
}
