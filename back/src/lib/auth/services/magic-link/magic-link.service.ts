import type { Result } from "../../../common";
import { success, failure } from "../../../common";
import { handleError, createErrorContext } from "../../../common/error-handler";
import type { IMagicLinkService } from "./magic-link.service.interface";
import type { AppUserRepository } from "../../../users/repositories";
import type { IEmailService } from "../../../email/services/email.service.interface";
import { AuthEmailTemplates } from "../email/auth-email.templates";
import { generateSecureToken } from "../../../utils/token-generator";
import { PrismaClient } from "@prisma/client";

const MAGIC_LINK_EXPIRATION_MINUTES = 15;

export class MagicLinkService implements IMagicLinkService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly appUserRepository: AppUserRepository,
    private readonly emailService: IEmailService
  ) {}

  async requestLink(email: string): Promise<Result<{ success: boolean }>> {
    try {
      const appUser = await this.appUserRepository.findByEmail(email);

      if (!appUser) {
        // To prevent email enumeration, we always return success, but do nothing.
        return success({ success: true });
      }

      const token = generateSecureToken();
      const expiresAt = new Date(Date.now() + MAGIC_LINK_EXPIRATION_MINUTES * 60 * 1000);

      await (this.prisma as any).magic_link_token.create({
        data: {
          userId: appUser.userId,
          token,
          expiresAt,
        },
      });
      
      const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/magic-link-callback?token=${token}`;

      await this.emailService.sendEmail(
        AuthEmailTemplates.magicLinkLogin({
          recipientEmail: email,
          verificationUrl,
        })
      );

      return success({ success: true });
    } catch (error) {
      return handleError(error, createErrorContext("requestMagicLink", { email }));
    }
  }
}
