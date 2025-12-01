import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins/username";
import { emailOTP } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { authPrisma } from "./common/prisma";
import { container } from "./di/container";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(authPrisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [process.env.CORS_ORIGIN || ""],
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    username(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        try {
          if (type === "forget-password") {
            const result = await container.emailService.sendEmail({
              to: email,
              subject: "Reset your password - LearnSup",
              html: `
								<!DOCTYPE html>
								<html>
									<head>
										<meta charset="utf-8">
										<meta name="viewport" content="width=device-width, initial-scale=1.0">
									</head>
									<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
										<div style="background-color: #2563eb; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
											<h1 style="color: white; margin: 0;">Reset Your Password</h1>
										</div>
										
										<p>Hello,</p>
										
										<p>You requested to reset your password for your LearnSup account. Use the following code to reset it:</p>
										
										<div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
											<h2 style="color: #2563eb; font-size: 32px; letter-spacing: 8px; margin: 0;">${otp}</h2>
										</div>
										
										<p>This code will expire in 1 hour.</p>
										
										<p>If you did not request this password reset, please ignore this email. Your password will remain unchanged.</p>
										
										<p style="margin-top: 30px;">Cordialement,<br>L'équipe LearnSup</p>
									</body>
								</html>
							`,
              text: `
								Reset Your Password
								
								Hello,
								
								You requested to reset your password for your LearnSup account. Use the following code to reset it:
								
								${otp}
								
								This code will expire in 1 hour.
								
								If you did not request this password reset, please ignore this email. Your password will remain unchanged.
								
								Cordialement,
								L'équipe LearnSup
							`,
            });

            if (!result.ok) {
              console.error("Failed to send OTP email:", result.error);
              throw new Error("Failed to send OTP email");
            }
          }
        } catch (error) {
          console.error("Error in sendVerificationOTP:", error);
          throw error;
        }
      },
    }),
  ],
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  },
  basePath: "/api/auth",
});
