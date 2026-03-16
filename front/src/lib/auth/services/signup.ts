import { signUpInputSchema } from "@ls-app/shared";
import { auth } from "../../auth";
import { Result, failure, validateInput, prisma } from "../../common";
import type { AppUserRepository } from "../../users/repositories";
import { container } from "../../di/container";

export class SignUpService {
  constructor(private readonly appUserRepository: AppUserRepository) {}

  async execute(
    input: unknown,
    headers: Headers,
  ): Promise<Result<{ userId: string }>> {
    // Validation
    const validation = validateInput(signUpInputSchema, input);
    if (!validation.ok) {
      return validation;
    }

    try {
      const { email, password, username } = validation.data;
      const name = validation.data.name ?? email.split("@")[0];

      const authResult = await auth.api
        .signUpEmail({
          body: { email, password, name, username },
          headers,
        })
        .catch((err: any) => {
          console.error("Better-auth signUpEmail error:", err);
          throw err;
        });

      console.log(
        "Better-auth result:",
        JSON.stringify(authResult.user, null, 2),
      );
      const id = authResult.user.id;

      // Sync business fields: userId (for backward compat), status, role
      // Utilisation d'un upsert pour être plus robuste si l'id n'est pas encore synchro
      await prisma.user
        .update({
          where: { id },
          data: {
            userId: id,
            status: "PENDING",
            role: null,
          },
        })
        .catch(async (err: any) => {
          console.warn(
            "Prisma update by id failed, trying by email...",
            err.message,
          );
          return prisma.user.update({
            where: { email },
            data: {
              userId: id,
              status: "PENDING",
              role: null,
            },
          });
        })
        .catch((err: any) => {
          console.error("Prisma user synchronization error (final):", err);
          throw err;
        });

      try {
        const { renderEmailTemplate } =
          await import("../../email/utils/render-email");
        const { WelcomeEmail } =
          await import("../../email/templates/WelcomeEmail");
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
          }),
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
