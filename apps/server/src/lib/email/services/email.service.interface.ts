import type { Result } from "../../common/types";

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
}

export interface IEmailService {
  sendEmail(options: SendEmailOptions): Promise<Result<{ messageId: string }>>;
}
