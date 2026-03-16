import { Resend } from "resend";
import type {
  IEmailService,
  SendEmailOptions,
} from "./email.service.interface";
import { failure, success } from "../../common/types";
import type { Result } from "../../common/types";
import { logger } from "../../common/logger";
import { externalApiErrorsTotal } from "../../metrics/prometheus";

export class ResendEmailService implements IEmailService {
  private readonly resend: Resend;
  private readonly defaultFrom: string;
  private readonly shouldSendEmails: boolean;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY environment variable is required");
    }
    this.resend = new Resend(apiKey);
    this.defaultFrom = process.env.RESEND_FROM_EMAIL || "noreply@example.com";
    // Only send emails if SEND_EMAIL is explicitly set to 'true'
    this.shouldSendEmails = process.env.SEND_EMAIL === "true";
  }

  async sendEmail(
    options: SendEmailOptions,
  ): Promise<Result<{ messageId: string }>> {
    try {
      const validationError = this.validateOptions(options);
      if (validationError) return validationError;

      const recipients = Array.isArray(options.to) ? options.to : [options.to];
      if (!this.shouldSendEmails) {
        return this.simulateSend(options, recipients);
      }

      const emailOptions = this.buildEmailOptions(options, recipients);
      return this.sendViaResend(emailOptions);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erreur inconnue";
      return failure(`Erreur lors de l'envoi de l'email: ${errorMessage}`, 500);
    }
  }

  private validateOptions(
    options: SendEmailOptions,
  ): Result<{ messageId: string }> | null {
    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    if (recipients.length === 0) {
      return failure("Au moins un destinataire est requis", 400);
    }
    if (!options.subject) {
      return failure("Le sujet de l'email est requis", 400);
    }
    if (!options.html && !options.text) {
      return failure("Le contenu de l'email (html ou text) est requis", 400);
    }
    return null;
  }

  private simulateSend(
    options: SendEmailOptions,
    recipients: string[],
  ): Result<{ messageId: string }> {
    logger.info(
      "Email not sent (SEND_EMAIL !== 'true') - Email would be sent:",
      {
        from: options.from || this.defaultFrom,
        to: recipients,
        subject: options.subject,
        hasHtml: !!options.html,
        hasText: !!options.text,
        hasAttachments: !!options.attachments?.length,
      },
    );
    return success({
      messageId: `simulated-${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}`,
    });
  }

  private buildEmailOptions(
    options: SendEmailOptions,
    recipients: string[],
  ): Record<string, unknown> {
    const emailOptions: Record<string, unknown> = {
      from: options.from || this.defaultFrom,
      to: recipients,
      subject: options.subject,
    };
    if (options.html) emailOptions.html = options.html;
    if (options.text) emailOptions.text = options.text;
    if (options.replyTo) emailOptions.replyTo = options.replyTo;
    if (options.attachments?.length) {
      emailOptions.attachments = options.attachments.map((att) => ({
        filename: att.filename,
        content:
          typeof att.content === "string"
            ? Buffer.from(att.content, "base64")
            : att.content,
        content_type: att.contentType,
      }));
    }
    return emailOptions;
  }

  private async sendViaResend(
    emailOptions: Record<string, unknown>,
  ): Promise<Result<{ messageId: string }>> {
    const result = await this.resend.emails.send(emailOptions as any);
    if (result.error) {
      externalApiErrorsTotal.labels("resend").inc();
      return failure(
        result.error.message || "Erreur lors de l'envoi de l'email",
        500,
      );
    }
    const messageId = result.data?.id;
    if (!messageId) {
      return failure("Aucun ID de message retourné par Resend", 500);
    }
    return success({ messageId });
  }
}
