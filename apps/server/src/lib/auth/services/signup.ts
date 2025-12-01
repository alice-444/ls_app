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
        const { renderEmailTemplate } = await import(
          "../../email/utils/render-email"
        );
        const { WelcomeEmail } = await import(
          "../../email/templates/WelcomeEmail"
        );
        const React = await import("react");

        const onboardingUrl = `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"
        }/onboarding`;

        const emailContent = await renderEmailTemplate(
          React.createElement(WelcomeEmail, {
            name,
            username,
            email,
            onboardingUrl,
          })
        );

        const emailResult = await container.emailService.sendEmail({
          to: email,
          subject: "Bienvenue sur LearnSup ! 🎓",
          html: emailContent.html,
          text: emailContent.text,
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
