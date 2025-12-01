import type {
  IChangePasswordService,
  ChangePasswordInput,
} from "./change-password.service.interface";
import type { IAuthUserRepository } from "../../../repositories/auth/auth-user.repository.interface";
import type { IAccountRepository } from "../../../repositories/auth/account.repository.interface";
import type { IAuthService } from "../shared/auth.service.interface";
import { PasswordValidationService } from "./password-validation.service";
import { Result, failure, success } from "../../../../common";

export class ChangePasswordService implements IChangePasswordService {
  constructor(
    private readonly authUserRepository: IAuthUserRepository,
    private readonly accountRepository: IAccountRepository,
    private readonly passwordValidation: PasswordValidationService,
    private readonly authService: IAuthService,
    private readonly emailService?: {
      sendEmail: (params: any) => Promise<Result<any>>;
    }
  ) {}

  async changePassword(
    userId: string,
    input: ChangePasswordInput
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

      const account = await this.accountRepository.findCredentialAccount(
        userId
      );
      if (!account || !account.password) {
        return failure("Account not found or password not set", 404);
      }

      const user = await this.authUserRepository.findById(userId);
      if (!user?.email) {
        return failure("User not found", 404);
      }


      const verifyResult = await this.authService.verifyCredentials({
            email: user.email,
            password: input.currentPassword,
        });

      if (!verifyResult.ok) {
          return failure("Current password is incorrect", 401);
      }


      const changeResult = await this.authService.changePassword({
          currentPassword: input.currentPassword,
          newPassword: input.newPassword,
          revokeOtherSessions: true,
      });

      if (!changeResult.ok) {
        return changeResult;
      }

      if (this.emailService) {
        try {
          const { renderEmailTemplate } = await import(
            "../../../../email/utils/render-email"
          );
          const { PasswordChangeConfirmation } = await import(
            "../../../../email/templates/PasswordChangeConfirmation"
          );
          const React = await import("react");

          const now = new Date();
          const date = now.toLocaleDateString("fr-FR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          const time = now.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          });

          const emailContent = await renderEmailTemplate(
            React.createElement(PasswordChangeConfirmation, {
              userName: user.name || undefined,
              date,
              time,
            })
          );

          const emailResult = await this.emailService.sendEmail({
            to: user.email,
            subject: "Confirmation de changement de mot de passe - LearnSup",
            html: emailContent.html,
            text: emailContent.text,
          });

          if (!emailResult.ok) {
            console.error("Failed to send password change confirmation email", {
              userId,
              email: user.email,
              error: emailResult.error,
            });
          }
        } catch (error) {
          console.error("Error sending password change confirmation email", {
            userId,
            email: user.email,
            error,
          });
        }
      }

      return success({ success: true });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return failure(`Failed to change password: ${errorMessage}`, 500);
    }
  }
}
