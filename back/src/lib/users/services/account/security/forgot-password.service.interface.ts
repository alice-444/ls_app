import type { Result } from "../../../../common";

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export interface IForgotPasswordService {
  requestPasswordReset(
    input: ForgotPasswordInput
  ): Promise<Result<{ success: boolean; message: string }>>;

  resetPassword(
    input: ResetPasswordInput
  ): Promise<Result<{ success: boolean }>>;
}
