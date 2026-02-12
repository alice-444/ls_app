import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join, resolve, normalize } from "path";
import { existsSync } from "fs";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";
import { fileTypeFromBuffer } from "file-type";
import { uploadRateLimit } from "@/lib/rate-limit";
import sharp from "sharp";
import { getAuthenticatedSession, applyRateLimit, handleRouteError } from "@/lib/api-helpers";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png"];
const MAX_IMAGE_WIDTH = 2000;
const MAX_IMAGE_HEIGHT = 2000;
const MAX_IMAGE_DIMENSION = 2000 * 2000;

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
          limit: rateLimitResult.result.limit,
          reset: rateLimitResult.result.reset,
          remaining: rateLimitResult.result.remaining,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimitResult.result.limit.toString(),
            "X-RateLimit-Remaining": rateLimitResult.result.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.result.reset.toString(),
          },
        },
      );
    }

    const formData = await req.formData();
    const file = formData.get("photo") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size FIRST (before processing)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size exceeds 5 MB limit." }, { status: 400 });
    }

    // Convert File to Buffer to analyze magic bytes
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate file type using magic bytes
    const fileType = await fileTypeFromBuffer(buffer);

    if (!fileType) {
      return NextResponse.json({ error: "Unable to detect file type. Only JPG and PNG are allowed." }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(fileType.mime.toLowerCase())) {
      return NextResponse.json(
        {
          error: `Invalid file type detected: ${fileType.mime}. Only JPG and PNG are allowed.`,
        },
        { status: 400 },
      );
    }

    // Validate extension matches the detected type
    const detectedExtension = fileType.ext.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(detectedExtension)) {
      return NextResponse.json(
        {
          error: `Invalid file extension: ${detectedExtension}. Only JPG and PNG are allowed.`,
        },
        { status: 400 },
      );
    }

    // Validate and process image content
    let processedImage: Buffer;
    try {
      const image = sharp(buffer);

      const metadata = await image.metadata();

      if (!metadata.width || !metadata.height) {
        return NextResponse.json({ error: "Invalid image: unable to read dimensions" }, { status: 400 });
      }

      if (metadata.width > MAX_IMAGE_WIDTH || metadata.height > MAX_IMAGE_HEIGHT) {
        return NextResponse.json(
          {
            error: `Image dimensions too large. Maximum: ${MAX_IMAGE_WIDTH}x${MAX_IMAGE_HEIGHT}px`,
          },
          { status: 400 },
        );
      }

      const totalPixels = metadata.width * metadata.height;
      if (totalPixels > MAX_IMAGE_DIMENSION) {
        return NextResponse.json(
          {
            error: `Image resolution too high. Maximum: ${MAX_IMAGE_DIMENSION} pixels`,
          },
          { status: 400 },
        );
      }

      const format = detectedExtension === "png" ? "png" : "jpeg";

      processedImage = await image
        .resize(MAX_IMAGE_WIDTH, MAX_IMAGE_HEIGHT, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .toFormat(format, {
          quality: format === "jpeg" ? 85 : undefined,
          compressionLevel: format === "png" ? 9 : undefined,
        })
        .toBuffer();
    } catch (error) {
      return NextResponse.json(
        {
          error: "Invalid or corrupted image file",
        },
        { status: 400 },
      );
    }

    const uploadsDir = resolve(process.cwd(), "uploads", "profiles");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const sanitizedUserId = userId.replaceAll(/[^a-zA-Z0-9_-]/, "");
    if (!sanitizedUserId || sanitizedUserId !== userId) {
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 });
    }

    const fileExtension = detectedExtension;
    const fileName = `${sanitizedUserId}-${randomUUID()}.${fileExtension}`;

    const filePath = join(uploadsDir, fileName);
    const normalizedPath = normalize(filePath);
    const resolvedPath = resolve(normalizedPath);

    if (!resolvedPath.startsWith(resolve(uploadsDir))) {
      return NextResponse.json({ error: "Invalid file path detected" }, { status: 400 });
    }

    await writeFile(filePath, processedImage);

    const photoUrl = `/api/profile/photo/${fileName}`;

    return NextResponse.json({ photoUrl });
  } catch (error) {
    return handleRouteError(error);
  }
}
