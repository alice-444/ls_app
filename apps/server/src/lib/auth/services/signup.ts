import { z } from "zod";
import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins/username";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { generateInternalId } from "../../utils/id-generator";
import { Result, failure, validateInput, prisma } from "../../common";
import type { AppUserRepository } from "../../users/repositories";
import { container } from "../../di/container";

const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [process.env.CORS_ORIGIN || ""],
  emailAndPassword: {
    enabled: true,
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

export const signUpInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(120),
  username: z.string().min(3).max(30),
});

type SignUpInput = z.infer<typeof signUpInputSchema>;

export class SignUpService {
  constructor(private readonly appUserRepository: AppUserRepository) {}

  async execute(
    input: unknown,
    headers: Headers
  ): Promise<Result<{ userId: string }>> {
    // Validation
    const validation = validateInput(signUpInputSchema, input);
    if (!validation.ok) {
      return validation;
    }

    try {
      const { email, password, username } = validation.data;
      const name = validation.data.name ?? email.split("@")[0];

      const authResult = await auth.api.signUpEmail({
        body: { email, password, name, username },
        headers,
      });

      const userId = authResult.user.id;

      await this.appUserRepository.upsert(
        userId,
        {
          id: generateInternalId(),
          userId,
          status: "PENDING",
          role: null,
        },
        {}
      );

      try {
        const emailResult = await container.emailService.sendEmail({
          to: email,
          subject: "Bienvenue sur LearnSup ! 🎓",
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: #2563eb; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                  <h1 style="color: white; margin: 0;">Bienvenue sur LearnSup !</h1>
                </div>
                
                <p>Bonjour ${name},</p>
                
                <p>Nous sommes ravis de vous accueillir sur LearnSup, la plateforme qui connecte les mentors et les apprentis pour des ateliers enrichissants.</p>
                
                <div style="background-color: #f1f5f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p style="margin: 0;"><strong>Votre compte :</strong></p>
                  <p style="margin: 5px 0 0 0;">Nom d'utilisateur : <strong>${username}</strong></p>
                  <p style="margin: 5px 0 0 0;">Email : <strong>${email}</strong></p>
                </div>
                
                <p><strong>Prochaines étapes :</strong></p>
                <ol>
                  <li>Complétez votre profil pour que les autres utilisateurs puissent vous découvrir</li>
                  <li>Choisissez votre rôle : Mentor ou Apprenti</li>
                  <li>Explorez les ateliers disponibles ou créez le vôtre</li>
                </ol>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${
                    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"
                  }/onboarding" 
                     style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Compléter mon profil
                  </a>
                </div>
                
                <p>Si vous avez des questions, n'hésitez pas à nous contacter via le support.</p>
                
                <p style="margin-top: 30px;">Cordialement,<br>L'équipe LearnSup</p>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                <p style="font-size: 12px; color: #6b7280; text-align: center;">
                  Cet email est envoyé automatiquement, merci de ne pas y répondre.
                </p>
              </body>
            </html>
          `,
          text: `
Bienvenue sur LearnSup !

Bonjour ${name},

Nous sommes ravis de vous accueillir sur LearnSup, la plateforme qui connecte les mentors et les apprentis pour des ateliers enrichissants.

Votre compte :
- Nom d'utilisateur : ${username}
- Email : ${email}

Prochaines étapes :
1. Complétez votre profil pour que les autres utilisateurs puissent vous découvrir
2. Choisissez votre rôle : Mentor ou Apprenti
3. Explorez les ateliers disponibles ou créez le vôtre

Compléter mon profil : ${
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"
          }/onboarding

Si vous avez des questions, n'hésitez pas à nous contacter via le support.

Cordialement,
L'équipe LearnSup
          `.trim(),
        });

        if (!emailResult.ok) {
          console.error("Failed to send welcome email", {
            userId,
            email,
            error: emailResult.error,
          });
        }
      } catch (error) {
        console.error("Error sending welcome email", {
          userId,
          email,
          error,
        });
      }

      return { ok: true, data: { userId } };
    } catch (error) {
      const status =
        error && typeof (error as any).status === "number"
          ? (error as any).status
          : 500;
      return failure((error as Error).message, status);
    }
  }
}
