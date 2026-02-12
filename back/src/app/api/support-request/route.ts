import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/common";
import { uploadRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

import { getAuthenticatedSession, applyRateLimit, handleRouteError } from "@/lib/api-helpers";
import { z } from "zod";
import { container } from "@/lib/di/container";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_TOTAL_FILES = 5;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

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

    const identifier = userId || req.headers.get("x-forwarded-for") || "unknown";
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
      return NextResponse.json({ error: "Données invalides", details: validation.error.issues }, { status: 400 });
    }

    const files: File[] = [];
    const fileCount = formData.getAll("attachments").length;

    if (fileCount > MAX_TOTAL_FILES) {
      return NextResponse.json({ error: `Maximum ${MAX_TOTAL_FILES} fichiers autorisés` }, { status: 400 });
    }

    for (let i = 0; i < fileCount; i++) {
      const file = formData.get(`attachments[${i}]`) as File | null;
      if (file) {
        if (file.size > MAX_FILE_SIZE) {
          return NextResponse.json(
            {
              error: `Le fichier ${file.name} dépasse la taille maximale de 10 MB`,
            },
            { status: 400 },
          );
        }

        if (!ALLOWED_MIME_TYPES.has(file.type)) {
          return NextResponse.json({ error: `Type de fichier non autorisé: ${file.name}` }, { status: 400 });
        }

        files.push(file);
      }
    }

    const attachments: Array<{ filename: string; url: string; size: number }> = [];

    if (files.length > 0) {
      const uploadsDir = resolve(process.cwd(), "uploads", "support");
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      for (const file of files) {
        const fileId = randomUUID();
        const extension = file.name.split(".").pop() || "";
        const sanitizedExtension = extension.replaceAll(/[^a-zA-Z0-9]/, "");
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
      const { renderEmailTemplate } = await import("../../../lib/email/utils/render-email");
      const { SupportRequestConfirmation } = await import("../../../lib/email/templates/SupportRequestConfirmation");
      const React = await import("react");

      const emailContent = await renderEmailTemplate(
        React.createElement(SupportRequestConfirmation, {
          subject: validation.data.subject,
          problemType: validation.data.problemType,
          requestId: supportRequest.id,
          hasAttachments: attachments.length > 0,
          attachmentCount: attachments.length,
        }),
      );

      const emailResult = await container.emailService.sendEmail({
        to: validation.data.email,
        subject: `Confirmation de votre demande de support - ${validation.data.subject}`,
        html: emailContent.html,
        text: emailContent.text,
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
      { status: 201 },
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
