import type { EmailPort, ResetPasswordEmailParams } from "../ports";

export class ConsoleEmailAdapter implements EmailPort {
  async sendResetPasswordEmail(
    params: ResetPasswordEmailParams
  ): Promise<void> {
    console.info(
      "[Email][ResetPassword] ->",
      JSON.stringify(
        {
          toEmail: params.toEmail,
          toName: params.toName ?? undefined,
          resetUrl: params.resetUrl,
          tokenPreview: params.token.slice(0, 6) + "...",
        },
        null,
        2
      )
    );
  }
}
