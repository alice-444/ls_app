import { z } from "zod";
import { auth } from "../../auth";
import { Result, failure, validateInput, prisma } from "../../common";
import type { AppUserRepository } from "../../users/repositories";
import { container } from "../../di/container";

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

      console.log("Attempting sign up with:", { email, name, username });

      const authResult = await auth.api.signUpEmail({
        body: { email, password, name, username },
        headers,
      }).catch((err: any) => {
        console.error("Better-auth signUpEmail error:", err);
        throw err;
      });

      console.log("Auth result success:", { userId: authResult.user.id });

      const id = authResult.user.id;

      // Synchronization of the user record created by better-auth
      // to ensure business 'userId' matches technical 'id' and other defaults.
      await prisma.user.update({
        where: { id },
        data: {
          userId: id, // Mapping business identity to auth identity
          status: "PENDING",
          role: null,
        },
      }).catch((err: any) => {
        console.error("Prisma user synchronization error:", err);
        throw err;
      });

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
            userId: id,
            email,
            error: emailResult.error,
          });
        }
      } catch (error) {
        console.error("Error sending welcome email", {
          userId: id,
          email,
          error,
        });
      }

      return { ok: true, data: { userId: id } };
    } catch (error) {
      const status =
        error && typeof (error as any).status === "number"
          ? (error as any).status
          : 500;
      return failure((error as Error).message, status);
    }
  }
}
