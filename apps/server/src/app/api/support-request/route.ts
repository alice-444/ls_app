import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join, resolve } from "path";
import { existsSync } from "fs";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/common";
import { uploadRateLimit } from "@/lib/rate-limit";
import {
  getAuthenticatedSession,
  applyRateLimit,
  handleRouteError,
} from "@/lib/api-helpers";
import { z } from "zod";
import { container } from "@/lib/di/container";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_TOTAL_FILES = 5;
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const supportRequestSchema = z.object({
  email: z.string().email(),
  subject: z.string().min(1).max(200),
  description: z.string().min(10).max(5000),
  problemType: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedSession(req);
    const userId = authResult.ok ? authResult.userId : null;

    const identifier =
      userId || req.headers.get("x-forwarded-for") || "unknown";
    const rateLimitResult = await applyRateLimit(uploadRateLimit, identifier);
    if (!rateLimitResult.ok) {
      return rateLimitResult.response;
    }

    const formData = await req.formData();

    const email = formData.get("email") as string;
    const subject = formData.get("subject") as string;
    const description = formData.get("description") as string;
    const problemType = formData.get("problemType") as string;

    const validation = supportRequestSchema.safeParse({
      email,
      subject,
      description,
      problemType,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validation.error.issues },
        { status: 400 }
      );
    }

    const files: File[] = [];
    const fileCount = formData.getAll("attachments").length;

    if (fileCount > MAX_TOTAL_FILES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_TOTAL_FILES} fichiers autorisés` },
        { status: 400 }
      );
    }

    for (let i = 0; i < fileCount; i++) {
      const file = formData.get(`attachments[${i}]`) as File | null;
      if (file) {
        if (file.size > MAX_FILE_SIZE) {
          return NextResponse.json(
            {
              error: `Le fichier ${file.name} dépasse la taille maximale de 10 MB`,
            },
            { status: 400 }
          );
        }

        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
          return NextResponse.json(
            { error: `Type de fichier non autorisé: ${file.name}` },
            { status: 400 }
          );
        }

        files.push(file);
      }
    }

    const attachments: Array<{ filename: string; url: string; size: number }> =
      [];

    if (files.length > 0) {
      const uploadsDir = resolve(process.cwd(), "uploads", "support");
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      for (const file of files) {
        const fileId = randomUUID();
        const extension = file.name.split(".").pop() || "";
        const sanitizedExtension = extension.replace(/[^a-zA-Z0-9]/g, "");
        const filename = `${fileId}.${sanitizedExtension}`;
        const filePath = join(uploadsDir, filename);

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        attachments.push({
          filename: file.name,
          url: `/api/support-request/attachments/${filename}`,
          size: file.size,
        });
      }
    }

    const supportRequest = await prisma.support_request.create({
      data: {
        id: randomUUID(),
        userId: userId || null,
        email: validation.data.email,
        subject: validation.data.subject,
        description: validation.data.description,
        problemType: validation.data.problemType,
        attachments: attachments.length > 0 ? attachments : undefined,
        status: "PENDING",
      },
    });

    try {
      const emailResult = await container.emailService.sendEmail({
        to: validation.data.email,
        subject: `Confirmation de votre demande de support - ${validation.data.subject}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h1 style="color: #2563eb; margin: 0;">Confirmation de votre demande</h1>
              </div>
              
              <p>Bonjour,</p>
              
              <p>Nous avons bien reçu votre demande de support concernant : <strong>${
                validation.data.subject
              }</strong></p>
              
              <div style="background-color: #f1f5f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Type de problème :</strong> ${
                  validation.data.problemType
                }</p>
                <p style="margin: 5px 0 0 0;"><strong>Numéro de demande :</strong> ${
                  supportRequest.id
                }</p>
              </div>
              
              <p>Notre équipe va examiner votre demande et vous répondra dans les plus brefs délais.</p>
              
              ${
                attachments.length > 0
                  ? `
                <p><strong>Pièces jointes :</strong></p>
                <ul>
                  ${attachments
                    .map(
                      (att) =>
                        `<li>${att.filename} (${(att.size / 1024).toFixed(
                          2
                        )} KB)</li>`
                    )
                    .join("")}
                </ul>
              `
                  : ""
              }
              
              <p style="margin-top: 30px;">Cordialement,<br>L'équipe LearnSup</p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="font-size: 12px; color: #6b7280; text-align: center;">
                Cet email est envoyé automatiquement, merci de ne pas y répondre.
              </p>
            </body>
          </html>
        `,
        text: `
Confirmation de votre demande de support

Bonjour,

Nous avons bien reçu votre demande de support concernant : ${
          validation.data.subject
        }

Type de problème : ${validation.data.problemType}
Numéro de demande : ${supportRequest.id}

Notre équipe va examiner votre demande et vous répondra dans les plus brefs délais.

${
  attachments.length > 0
    ? `Pièces jointes :\n${attachments
        .map((att) => `- ${att.filename} (${(att.size / 1024).toFixed(2)} KB)`)
        .join("\n")}`
    : ""
}

Cordialement,
L'équipe LearnSup
        `.trim(),
      });

      if (!emailResult.ok) {
        console.error("Failed to send confirmation email", {
          supportRequestId: supportRequest.id,
          error: emailResult.error,
        });
      }
    } catch (error) {
      console.error("Error sending confirmation email", {
        supportRequestId: supportRequest.id,
        error,
      });
    }

    return NextResponse.json(
      {
        success: true,
        id: supportRequest.id,
        message: "Votre demande a été envoyée avec succès",
      },
      { status: 201 }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
