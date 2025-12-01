export interface EmailChangeVerificationTemplateData {
  verificationUrl: string;
  tokenExpiryHours: number;
}

export interface EmailChangeSecurityAlertTemplateData {
  currentEmail: string;
  requestedNewEmail: string;
}

export interface EmailTemplateResult {
  html: string;
  text: string;
}

export interface IEmailTemplateService {
  renderEmailChangeVerification(
    data: EmailChangeVerificationTemplateData
  ): EmailTemplateResult;

  renderEmailChangeSecurityAlert(
    data: EmailChangeSecurityAlertTemplateData
  ): EmailTemplateResult;
}
