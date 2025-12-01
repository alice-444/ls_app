import { randomBytes } from "crypto";
import type {
  IChangeEmailService,
  ChangeEmailInput,
} from "./change-email.service.interface";
import type { IAuthUserRepository } from "../../../repositories/auth/auth-user.repository.interface";
import type { IVerificationRepository } from "../../../repositories/verification/verification.repository.interface";
import type { IEmailTemplateService } from "../shared/email-template.service.interface";
import type { IAuthService } from "../shared/auth.service.interface";
import { Result, failure, success } from "../../../../common";

export class ChangeEmailService implements IChangeEmailService {
  private readonly TOKEN_EXPIRY_HOURS = 24;

  constructor(
    private readonly authUserRepository: IAuthUserRepository,
    private readonly verificationRepository: IVerificationRepository,
    private readonly emailService: {
      sendEmail: (params: any) => Promise<Result<any>>;
    },
    private readonly emailTemplateService: IEmailTemplateService,
    private readonly authService: IAuthService
  ) {}

  async requestEmailChange(
    userId: string,
    input: ChangeEmailInput
  ): Promise<Result<{ success: boolean; message: string }>> {
    try {
      const user = await this.authUserRepository.findById(userId);
      if (!user || !user.email) {
        return failure("User not found", 404);
      }

      if (user.email.toLowerCase() === input.newEmail.toLowerCase()) {
        return failure("New email must be different from current email", 400);
      }

      const existingUser = await this.authUserRepository.findByEmail(
        input.newEmail
      );
      if (existingUser) {
        return failure("Email is already in use", 400);
      }


      const verifyResult = await this.authService.verifyCredentials({
        email: user.email,
        password: input.currentPassword,
      });

      if (!verifyResult.ok) {
        return failure("Current password is incorrect", 401);
      }

      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + this.TOKEN_EXPIRY_HOURS);

      await this.verificationRepository.upsertEmailChange(
        userId,
        input.newEmail,
        token,
        expiresAt
      );

      const verificationUrl = `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"
      }/verify-email-change?token=${token}`;

      const verificationTemplate = this.emailTemplateService.renderEmailChangeVerification({
        verificationUrl,
        tokenExpiryHours: this.TOKEN_EXPIRY_HOURS,
      });

      const emailResult = await this.emailService.sendEmail({
        to: input.newEmail,
        subject: "Verify your new email address - LearnSup",
        html: verificationTemplate.html,
        text: verificationTemplate.text,
      });

      if (!emailResult.ok) {
        console.error("Failed to send verification email:", emailResult.error);
        return failure("Failed to send verification email", 500);
      }

      const securityAlertTemplate = this.emailTemplateService.renderEmailChangeSecurityAlert({
        currentEmail: user.email,
        requestedNewEmail: input.newEmail,
      });

      const alertResult = await this.emailService.sendEmail({
        to: user.email,
        subject: "Security Alert: Email Change Request - LearnSup",
        html: securityAlertTemplate.html,
        text: securityAlertTemplate.text,
      });

      if (!alertResult.ok) {
        console.error("Failed to send security alert:", alertResult.error);
      }

      return success({
        success: true,
        message:
          "A validation link has been sent to your new address. The change will not take effect until you click it.",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return failure(`Failed to request email change: ${errorMessage}`, 500);
    }
  }

  async verifyEmailChange(
    token: string
  ): Promise<Result<{ success: boolean }>> {
    try {
      const verification =
        await this.verificationRepository.findEmailChangeToken(token);
      if (!verification) {
        return failure("Invalid or expired token", 400);
      }

      const parts = verification.identifier.split(":");
      if (parts.length < 3) {
        return failure("Invalid verification token format", 400);
      }

      const userId = parts[1];
      const newEmail = parts.slice(2).join(":");

      const user = await this.authUserRepository.findById(userId);
      if (!user) {
        return failure("User not found", 404);
      }

      const existingUser = await this.authUserRepository.findByEmail(newEmail);
      if (existingUser && existingUser.id !== userId) {
        return failure("Email is already in use", 400);
      }

      await this.authUserRepository.updateEmail(userId, newEmail);
      await this.verificationRepository.deleteById(verification.id);

      return success({ success: true });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return failure(`Failed to verify email change: ${errorMessage}`, 500);
    }
  }
}
