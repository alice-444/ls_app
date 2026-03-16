import { NextRequest, NextResponse } from "next/server";
import { fileTypeFromBuffer } from "file-type";
import { uploadRateLimit } from "@/lib/rate-limit-server";
import sharp from "sharp";
import {
  getAuthenticatedSession,
  applyRateLimit,
  handleRouteError,
} from "@/lib/api-helpers";
import { container } from "@/lib/di/container";
import { logger } from "@/lib/common/logger";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/jpg", "image/png"]);
const MAX_IMAGE_WIDTH = 1200;
const MAX_IMAGE_HEIGHT = 1200;

export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedSession(req);
    if (!authResult.ok) {
      return authResult.response;
    }
    const { userId } = authResult;

    const rateLimitResult = await applyRateLimit(uploadRateLimit, userId);
    if (!rateLimitResult.ok) {
      return NextResponse.json(
        {
          error: "Too many upload requests. Please try again later.",
        },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("photo") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 5 MB limit." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileType = await fileTypeFromBuffer(buffer);

    if (!fileType || !ALLOWED_MIME_TYPES.has(fileType.mime.toLowerCase())) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPG and PNG are allowed." },
        { status: 400 }
      );
    }

    // Process image with Sharp to normalize and resize
    let processedImage: Buffer;
    try {
      processedImage = await sharp(buffer)
        .resize(MAX_IMAGE_WIDTH, MAX_IMAGE_HEIGHT, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .toFormat("jpeg", { quality: 85 })
        .toBuffer();
    } catch (error) {
      logger.warn("Image processing failed (invalid or corrupted)", {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      return NextResponse.json(
        { error: "Invalid or corrupted image file" },
        { status: 400 }
      );
    }

    // Use FileStorageService (Cloudinary or Local)
    const uploadResult = await container.fileStorageService.uploadFile(processedImage, {
      folder: "learnsup/profiles",
      publicId: `${userId}-${Date.now()}`,
      tags: ["profile-photo", userId],
    });

    if (!uploadResult.ok) {
      return NextResponse.json(
        { error: uploadResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ photoUrl: uploadResult.data.url });
  } catch (error) {
    return handleRouteError(error);
  }
}
