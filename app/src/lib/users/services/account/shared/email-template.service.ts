import type {
  IEmailTemplateService,
  EmailChangeVerificationTemplateData,
  EmailChangeSecurityAlertTemplateData,
  EmailTemplateResult,
} from "./email-template.service.interface";

export class EmailTemplateService implements IEmailTemplateService {
  async renderEmailChangeVerification(
    data: EmailChangeVerificationTemplateData
  ): Promise<EmailTemplateResult> {
    const React = await import("react");
    const { EmailChangeVerification } = await import(
      "../../../../email/templates/EmailChangeVerification"
    );
    const { renderEmailTemplate } = await import(
      "../../../../email/utils/render-email"
    );

    return await renderEmailTemplate(
      React.createElement(EmailChangeVerification, {
        verificationUrl: data.verificationUrl,
        tokenExpiryHours: data.tokenExpiryHours,
      })
    );
  }

  async renderEmailChangeSecurityAlert(
    data: EmailChangeSecurityAlertTemplateData
  ): Promise<EmailTemplateResult> {
    const React = await import("react");
    const { EmailChangeSecurityAlert } = await import(
      "../../../../email/templates/EmailChangeSecurityAlert"
    );
    const { renderEmailTemplate } = await import(
      "../../../../email/utils/render-email"
    );

    return await renderEmailTemplate(
      React.createElement(EmailChangeSecurityAlert, {
        currentEmail: data.currentEmail,
        requestedNewEmail: data.requestedNewEmail,
      })
    );
  }
}
