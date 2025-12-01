import type {
  IEmailTemplateService,
  EmailChangeVerificationTemplateData,
  EmailChangeSecurityAlertTemplateData,
  EmailTemplateResult,
} from "./email-template.service.interface";

export class EmailTemplateService implements IEmailTemplateService {
  renderEmailChangeVerification(
    data: EmailChangeVerificationTemplateData
  ): EmailTemplateResult {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #2563eb; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Verify Your New Email</h1>
          </div>
          
          <p>Hello,</p>
          
          <p>You requested to change your email address on LearnSup. To complete this change, please click the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.verificationUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #2563eb;">${data.verificationUrl}</p>
          
          <p>This link will expire in ${data.tokenExpiryHours} hours.</p>
          
          <p>If you did not request this change, please ignore this email or contact support.</p>
          
          <p style="margin-top: 30px;">Cordialement,<br>L'équipe LearnSup</p>
        </body>
      </html>
    `;

    const text = `
      Verify Your New Email
      
      Hello,
      
      You requested to change your email address on LearnSup. To complete this change, please visit:
      
      ${data.verificationUrl}
      
      This link will expire in ${data.tokenExpiryHours} hours.
      
      If you did not request this change, please ignore this email or contact support.
      
      Cordialement,
      L'équipe LearnSup
    `;

    return { html, text };
  }

  renderEmailChangeSecurityAlert(
    data: EmailChangeSecurityAlertTemplateData
  ): EmailTemplateResult {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #dc2626; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Security Alert</h1>
          </div>
          
          <p>Hello,</p>
          
          <p>Someone requested to change the email address associated with your LearnSup account.</p>
          
          <div style="background-color: #f1f5f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Current email:</strong> ${data.currentEmail}</p>
            <p style="margin: 5px 0 0 0;"><strong>Requested new email:</strong> ${data.requestedNewEmail}</p>
          </div>
          
          <p>If this was you, please verify the change by clicking the link sent to your new email address.</p>
          
          <p><strong>If this was NOT you:</strong> Please contact our support team immediately to secure your account.</p>
          
          <p style="margin-top: 30px;">Cordialement,<br>L'équipe LearnSup</p>
        </body>
      </html>
    `;

    const text = `
      Security Alert
      
      Hello,
      
      Someone requested to change the email address associated with your LearnSup account.
      
      Current email: ${data.currentEmail}
      Requested new email: ${data.requestedNewEmail}
      
      If this was you, please verify the change by clicking the link sent to your new email address.
      
      If this was NOT you, please contact our support team immediately to secure your account.
      
      Cordialement,
      L'équipe LearnSup
    `;

    return { html, text };
  }
}
