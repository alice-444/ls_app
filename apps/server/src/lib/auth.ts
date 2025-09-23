import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins/username";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "../../prisma/generated/client/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { getEmailPort } from "./email";

const prisma = new PrismaClient().$extends(withAccelerate());

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [process.env.CORS_ORIGIN || ""],
  emailAndPassword: {
    enabled: true,
    async sendResetPassword(data, _request) {
      const email = data.user.email;
      if (!email) {
        return;
      }
      const appUrl =
        process.env.NEXT_PUBLIC_WEB_URL ||
        process.env.WEB_URL ||
        "http://localhost:3001";
      const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(
        data.token
      )}`;
      const emailPort = getEmailPort();
      await emailPort.sendResetPasswordEmail({
        toEmail: email,
        toName: data.user.name,
        resetUrl,
        token: data.token,
      });
    },
    revokeSessionsOnPasswordReset: true,
  },
  plugins: [username()],
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  },
});
