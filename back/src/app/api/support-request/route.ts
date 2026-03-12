import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { fileTypeFromBuffer } from "file-type";
import { prisma } from "@/lib/common";
import { uploadRateLimit } from "@/lib/rate-limit";
import {
  getAuthenticatedSession,
  applyRateLimit,
  handleRouteError,
} from "@/lib/api-helpers";

import {
  supportRequestSchema,
  SUPPORT_ATTACHMENT_CONFIG,
} from "@ls-app/shared";
import type { SupportRequestInput } from "@ls-app/shared";
import { container } from "@/lib/di/container";

const MAX_FILE_SIZE = SUPPORT_ATTACHMENT_CONFIG.maxSize;
const MAX_TOTAL_FILES = SUPPORT_ATTACHMENT_CONFIG.maxCount;
const ALLOWED_MIME_TYPES = new Set<string>(
  SUPPORT_ATTACHMENT_CONFIG.allowedMimeTypes,
);

type ValidationResult =
  | { ok: true; data: SupportRequestInput }
  | { ok: false; response: NextResponse };

function validateFormData(formData: FormData): ValidationResult {
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
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Données invalides", details: validation.error.issues },
        { status: 400 },
      ),
    };
  }
  return { ok: true, data: validation.data };
}

async function validateAndCollectFiles(
  formData: FormData,
): Promise<
  { ok: true; files: File[] } | { ok: false; response: NextResponse }
> {
  const fileCount = formData.getAll("attachments").length;

  if (fileCount > MAX_TOTAL_FILES) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: `Maximum ${MAX_TOTAL_FILES} fichiers autorisés` },
        { status: 400 },
      ),
    };
  }

  const files: File[] = [];
  for (let i = 0; i < fileCount; i++) {
    const file = formData.get(`attachments[${i}]`) as File | null;
    if (!file) continue;

    if (file.size > MAX_FILE_SIZE) {
      return {
        ok: false,
        response: NextResponse.json(
          {
            error: `Le fichier ${file.name} dépasse la taille maximale de 10 MB`,
          },
          { status: 400 },
        ),
      };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileType = await fileTypeFromBuffer(buffer);

    if (!fileType || !ALLOWED_MIME_TYPES.has(fileType.mime.toLowerCase())) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: `Type de fichier non autorisé ou corrompu: ${file.name}` },
          { status: 400 },
        ),
      };
    }
    files.push(file);
  }

  return { ok: true, files };
}

async function uploadAttachments(
  files: File[],
): Promise<Array<{ filename: string; url: string; size: number }>> {
  if (files.length === 0) return [];

  const uploadsDir = resolve(process.cwd(), "uploads", "support");
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
  }

  const attachments: Array<{ filename: string; url: string; size: number }> =
    [];
  for (const file of files) {
    const fileId = randomUUID();
    const extension = file.name.split(".").pop() || "";
    const sanitizedExtension = extension.replaceAll(/[^a-zA-Z0-9]/g, "");
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
  return attachments;
}

async function sendConfirmationEmail(
  supportRequestId: string,
  data: SupportRequestInput,
  attachmentCount: number,
): Promise<void> {
  try {
    const { renderEmailTemplate } =
      await import("../../../lib/email/utils/render-email");
    const { SupportRequestConfirmation } =
      await import("../../../lib/email/templates/SupportRequestConfirmation");
    const React = await import("react");

    const emailContent = await renderEmailTemplate(
      React.createElement(SupportRequestConfirmation, {
        subject: data.subject,
        problemType: data.problemType,
        requestId: supportRequestId,
        hasAttachments: attachmentCount > 0,
        attachmentCount,
      }),
    );

    const emailResult = await container.emailService.sendEmail({
      to: data.email,
      subject: `Confirmation de votre demande de support - ${data.subject}`,
      html: emailContent.html,
      text: emailContent.text,
    });

    if (!emailResult.ok) {
      console.error("Failed to send confirmation email", {
        supportRequestId,
        error: emailResult.error,
      });
    }
  } catch (error) {
    console.error("Error sending confirmation email", {
      supportRequestId,
      error,
    });
  }
}

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

    const validationResult = validateFormData(formData);
    if (!validationResult.ok) {
      return validationResult.response;
    }

    const filesResult = await validateAndCollectFiles(formData);
    if (!filesResult.ok) {
      return filesResult.response;
    }

    const attachments = await uploadAttachments(filesResult.files);

    const appUser = userId
      ? await container.appUserRepository.findByUserId(userId)
      : null;

    const supportRequest = await (prisma as any).support_request.create({
      data: {
        userId: appUser?.id || null,
        email: validationResult.data.email,
        subject: validationResult.data.subject,
        description: validationResult.data.description,
        problemType: validationResult.data.problemType,
        status: "PENDING",
        attachments: attachments.length > 0 ? attachments : null,
      },
    });

    await sendConfirmationEmail(
      supportRequest.id,
      validationResult.data,
      attachments.length,
    );

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
