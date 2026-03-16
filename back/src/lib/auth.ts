import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { username, magicLink, emailOTP } from "better-auth/plugins";
import { container } from "./di/container";
import { renderEmailTemplate } from "./email/utils/render-email";
import { AuthEmailVerification } from "./email/templates/AuthEmailVerification";
import { AuthPasswordResetEmail } from "./email/templates/AuthPasswordResetEmail";
import { AuthMagicLinkEmail } from "./email/templates/AuthMagicLinkEmail";
import * as React from "react";

const getCookieDomain = () => {
  if (process.env.NODE_ENV === "development") return undefined;
  const url = process.env.BETTER_AUTH_URL || "";
  try {
    const hostname = new URL(url).hostname;
    // Extraire le domaine racine (ex: learnsup.fr de api.learnsup.fr)
    const parts = hostname.split(".");
    if (parts.length >= 2) {
      return `.${parts.slice(-2).join(".")}`;
    }
    return undefined;
  } catch {
    return ".learnsup.fr"; // Fallback safe pour la prod LearnSup
  }
};

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  cookie: {
    domain: getCookieDomain(),
    path: "/",
    extraAttributes: {
      SameSite: "None",
      Secure: true,
    },
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production" || process.env.BETTER_AUTH_URL?.startsWith("https"),
  },
  trustedOrigins: [process.env.CORS_ORIGIN || "", "https://app.learnsup.fr", "http://localhost:3001"],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url, token }, request) => {
      const { html, text } = await renderEmailTemplate(React.createElement(AuthPasswordResetEmail, { url }));
      await container.emailService.sendEmail({
        to: user.email,
        subject: "Réinitialisation de votre mot de passe LearnSup",
        text,
        html,
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      const { html, text } = await renderEmailTemplate(React.createElement(AuthEmailVerification, { url }));
      await container.emailService.sendEmail({
        to: user.email,
        subject: "Vérifiez votre adresse e-mail LearnSup",
        text,
        html,
      });
    },
  },
  plugins: [
    username(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }, request) {
        if (type === "forget-password") {
          const { html, text } = await renderEmailTemplate(React.createElement(AuthPasswordResetEmail, { otp }));
          await container.emailService.sendEmail({
            to: email,
            subject: "Réinitialisation de votre mot de passe LearnSup",
            text,
            html,
          });
        } else if (type === "email-verification") {
          const { html, text } = await renderEmailTemplate(React.createElement(AuthEmailVerification, { otp }));
          await container.emailService.sendEmail({
            to: email,
            subject: "Code de vérification LearnSup",
            text,
            html,
          });
        }
      },
    }),
    magicLink({
      sendMagicLink: async (data, request) => {
        // data.url ressemble à https://api.learnsup.fr/api/auth/magic-link/verify?token=...
        // Nous le transformons pour pointer vers le frontend (Verification côté client)
        const url = new URL(data.url);
        const token = url.searchParams.get("token");
        const frontendUrl = process.env.CORS_ORIGIN || "https://app.learnsup.fr";
        const verificationUrl = `${frontendUrl}/auth/verify?token=${token}`;

        const { html, text } = await renderEmailTemplate(
          React.createElement(AuthMagicLinkEmail, { url: verificationUrl }),
        );
        await container.emailService.sendEmail({
          to: data.email,
          subject: "Votre lien de connexion LearnSup",
          text,
          html,
        });
      },
    }),
  ],
});
