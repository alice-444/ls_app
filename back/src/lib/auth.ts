import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins/username";
import { emailOTP } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { authPrisma } from "./common/prisma";
import { container } from "./di/container";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
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
            const { renderEmailTemplate } = await import(
              "./email/utils/render-email"
            );
            const { PasswordResetEmail } = await import(
              "./email/templates/PasswordResetEmail"
            );
            const React = await import("react");

            const emailContent = await renderEmailTemplate(
              React.createElement(PasswordResetEmail, { otp })
            );

            const result = await container.emailService.sendEmail({
              to: email,
              subject: "Reset your password - LearnSup",
              html: emailContent.html,
              text: emailContent.text,
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
