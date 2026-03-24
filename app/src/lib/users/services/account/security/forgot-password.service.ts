import type {
  IForgotPasswordService,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "./forgot-password.service.interface";
import { PasswordValidationService } from "./password-validation.service";
import type { IHttpClient } from "../shared/http-client.interface";
import { Result, failure, success } from "../../../../common";

export class ForgotPasswordService implements IForgotPasswordService {
  private readonly GENERIC_MESSAGE =
    "If an account exists for this email, a reset link has been sent.";

  constructor(
    private readonly passwordValidation: PasswordValidationService,
    private readonly httpClient: IHttpClient
  ) {}

  async requestPasswordReset(
    input: ForgotPasswordInput
  ): Promise<Result<{ success: boolean; message: string }>> {
    try {
      const result = await this.httpClient.post(
        "/api/auth/forget-password",
        { email: input.email }
      );

      if (!result.ok) {
        console.error("Error sending password reset OTP:", result.error);
      }

      return success({ success: true, message: this.GENERIC_MESSAGE });
    } catch (error) {
      console.error("Error in requestPasswordReset:", error);
      return success({ success: true, message: this.GENERIC_MESSAGE });
    }
  }

  async resetPassword(
    input: ResetPasswordInput
  ): Promise<Result<{ success: boolean }>> {
    try {
      const matchValidation = this.passwordValidation.validateMatch(
        input.newPassword,
        input.confirmPassword
      );
      if (!matchValidation.valid) {
        return failure(matchValidation.error!, 400);
      }

      const passwordValidation = this.passwordValidation.validate(
        input.newPassword
      );
      if (!passwordValidation.valid) {
        return failure(passwordValidation.error!, 400);
      }

      const result = await this.httpClient.post(
        "/api/auth/reset-password",
        {
          newPassword: input.newPassword,
          token: input.otp,
        }
      );

      if (!result.ok) {
        const errorMessage = result.error || "Failed to reset password";

        if (
          result.status === 400 ||
          errorMessage.includes("invalid") ||
          errorMessage.includes("expired")
        ) {
          return failure("Invalid or expired OTP", 400);
        }

        return failure(errorMessage, result.status || 500);
      }

      return success({ success: true });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return failure(`Failed to reset password: ${errorMessage}`, 500);
    }
  }
}
