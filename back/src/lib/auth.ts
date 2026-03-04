import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { username, magicLink, emailOTP } from "better-auth/plugins";
import { container } from "./di/container";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [process.env.CORS_ORIGIN || ""],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      await container.emailService.sendEmail({
        to: user.email,
        subject: "Vérifiez votre adresse e-mail LearnSup",
        text: `Veuillez vérifier votre adresse e-mail en cliquant sur ce lien : ${url}`,
        html: `<p>Bienvenue sur LearnSup ! Veuillez vérifier votre adresse e-mail en cliquant sur le bouton ci-dessous.</p>
               <a href="${url}" style="padding: 10px 20px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px;">Vérifier mon e-mail</a>`,
      });
    },
  },
  plugins: [
    username(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }, request) {
        if (type === "forget-password") {
          await container.emailService.sendEmail({
            to: email,
            subject: "Réinitialisation de votre mot de passe LearnSup",
            text: `Votre code de réinitialisation est : ${otp}`,
            html: `<p>Vous avez demandé une réinitialisation de mot de passe. Voici votre code à 6 chiffres :</p>
                   <h2 style="font-size: 24px; font-weight: bold; color: #0070f3;">${otp}</h2>
                   <p>Ce code est valable pendant 10 minutes.</p>`,
          });
        } else if (type === "email-verification") {
          await container.emailService.sendEmail({
            to: email,
            subject: "Code de vérification LearnSup",
            text: `Votre code de vérification est : ${otp}`,
            html: `<p>Voici votre code de vérification LearnSup :</p>
                   <h2 style="font-size: 24px; font-weight: bold; color: #0070f3;">${otp}</h2>`,
          });
        }
      },
    }),
    magicLink({
      sendMagicLink: async (data, request) => {
        await container.emailService.sendEmail({
          to: data.email,
          subject: "Votre lien de connexion LearnSup",
          text: `Cliquez ici pour vous connecter : ${data.url}`,
          html: `<p>Cliquez sur le bouton ci-dessous pour vous connecter à votre compte LearnSup.</p>
                 <a href="${data.url}" style="padding: 10px 20px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px;">Se connecter</a>
                 <p>Si vous n'avez pas demandé ce lien, vous pouvez ignorer cet e-mail.</p>`,
        });
      },
    }),
  ],
});
