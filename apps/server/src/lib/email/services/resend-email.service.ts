import { Resend } from "resend";
import type {
  IEmailService,
  SendEmailOptions,
  EmailAttachment,
} from "./email.service.interface";
import { failure, success, type Result } from "../../common/types";

export class ResendEmailService implements IEmailService {
  private resend: Resend;
  private defaultFrom: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY environment variable is required");
    }
    this.resend = new Resend(apiKey);
    this.defaultFrom = process.env.RESEND_FROM_EMAIL || "noreply@example.com";
  }

  async sendEmail(
    options: SendEmailOptions
  ): Promise<Result<{ messageId: string }>> {
    try {
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

      const emailOptions: any = {
        from: options.from || this.defaultFrom,
        to: recipients,
        subject: options.subject,
      };

      if (options.html) {
        emailOptions.html = options.html;
      }

      if (options.text) {
        emailOptions.text = options.text;
      }

      if (options.replyTo) {
        emailOptions.replyTo = options.replyTo;
      }

      if (options.attachments && options.attachments.length > 0) {
        emailOptions.attachments = options.attachments.map((att) => ({
          filename: att.filename,
          content:
            typeof att.content === "string"
              ? Buffer.from(att.content, "base64")
              : att.content,
          content_type: att.contentType,
        }));
      }

      const result = await this.resend.emails.send(emailOptions);

      if (result.error) {
        return failure(
          result.error.message || "Erreur lors de l'envoi de l'email",
          500
        );
      }

      if (!result.data?.id) {
        return failure("Aucun ID de message retourné par Resend", 500);
      }

      return success({ messageId: result.data.id });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erreur inconnue";
      return failure(`Erreur lors de l'envoi de l'email: ${errorMessage}`, 500);
    }
  }
}
