interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export const AuthEmailTemplates = {
  magicLinkLogin: (params: { recipientEmail: string; verificationUrl: string }): EmailTemplate => ({
    subject: "Your Magic Link Login",
    html: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #2563eb; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
      <h1 style="color: white; margin: 0;">Login to Your Account</h1>
    </div>
    <p>Hello,</p>
    <p>Click the button below to log in to your account:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${params.verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Log In
      </a>
    </div>
    <p>This link will expire in 15 minutes.</p>
    <p>If you didn't request this login, please ignore this email.</p>
    <p style="margin-top: 30px;">Best regards,<br>The LearnSup Team</p>
  </body>
</html>`,
    text: `Hello,\n\nClick the following link to log in to your account:\n\n${params.verificationUrl}\n\nThis link will expire in 15 minutes.\n\nIf you didn't request this login, please ignore this email.\n\nBest regards,\nThe LearnSup Team`,
  }),
};