import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { username, magicLink } from "better-auth/plugins";
import { container } from "./di/container";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [process.env.CORS_ORIGIN || ""],
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    username(),
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
