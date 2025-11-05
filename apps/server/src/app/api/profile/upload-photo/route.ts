import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join, resolve, normalize } from "path";
import { existsSync } from "fs";
import { randomUUID } from "crypto";
import { fileTypeFromBuffer } from "file-type";
import { uploadRateLimit } from "@/lib/rate-limit";
import sharp from "sharp";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png"];
const MAX_IMAGE_WIDTH = 2000;
const MAX_IMAGE_HEIGHT = 2000;
const MAX_IMAGE_DIMENSION = 2000 * 2000;

export async function POST(req: NextRequest) {
  let session: Awaited<ReturnType<typeof auth.api.getSession>> | null = null;

  try {
    // Retrieve the user's session
    session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting
    const identifier = session.user.id;
    const { success, limit, reset, remaining } = await uploadRateLimit.limit(
      identifier
    );

    if (!success) {
      return NextResponse.json(
        {
          error: "Too many upload requests. Please try again later.",
          limit,
          reset,
          remaining,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        }
      );
    }

    const formData = await req.formData();
    const file = formData.get("photo") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size FIRST (before processing)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 5 MB limit." },
        { status: 400 }
      );
    }

    // Convert File to Buffer to analyze magic bytes
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate file type using magic bytes
    const fileType = await fileTypeFromBuffer(buffer);

    if (!fileType) {
      return NextResponse.json(
        { error: "Unable to detect file type. Only JPG and PNG are allowed." },
        { status: 400 }
      );
    }

    // Validate MIME type from magic bytes
    if (!ALLOWED_MIME_TYPES.includes(fileType.mime.toLowerCase())) {
      return NextResponse.json(
        {
          error: `Invalid file type detected: ${fileType.mime}. Only JPG and PNG are allowed.`,
        },
        { status: 400 }
      );
    }

    // Validate extension matches the detected type
    const detectedExtension = fileType.ext.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(detectedExtension)) {
      return NextResponse.json(
        {
          error: `Invalid file extension: ${detectedExtension}. Only JPG and PNG are allowed.`,
        },
        { status: 400 }
      );
    }

    // Validate and process image content
    let processedImage: Buffer;
    try {
      const image = sharp(buffer);

      // Get image metadata to validate it's a real image
      const metadata = await image.metadata();

      if (!metadata.width || !metadata.height) {
        return NextResponse.json(
          { error: "Invalid image: unable to read dimensions" },
          { status: 400 }
        );
      }

      // Check dimensions to prevent DoS (too large images)
      if (
        metadata.width > MAX_IMAGE_WIDTH ||
        metadata.height > MAX_IMAGE_HEIGHT
      ) {
        return NextResponse.json(
          {
            error: `Image dimensions too large. Maximum: ${MAX_IMAGE_WIDTH}x${MAX_IMAGE_HEIGHT}px`,
          },
          { status: 400 }
        );
      }

      // Check total pixels to prevent extremely large images
      const totalPixels = metadata.width * metadata.height;
      if (totalPixels > MAX_IMAGE_DIMENSION) {
        return NextResponse.json(
          {
            error: `Image resolution too high. Maximum: ${MAX_IMAGE_DIMENSION} pixels`,
          },
          { status: 400 }
        );
      }

      // Process and optimize the image
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
      // If sharp fails, the image is likely corrupted or invalid
      return NextResponse.json(
        {
          error: "Invalid or corrupted image file",
        },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = resolve(process.cwd(), "uploads", "profiles");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const sanitizedUserId = session.user.id.replace(/[^a-zA-Z0-9_-]/g, "");
    if (!sanitizedUserId || sanitizedUserId !== session.user.id) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    // Generate filename
    const fileExtension = detectedExtension;
    const fileName = `${sanitizedUserId}-${randomUUID()}.${fileExtension}`;

    const filePath = join(uploadsDir, fileName);
    const normalizedPath = normalize(filePath);
    const resolvedPath = resolve(normalizedPath);

    if (!resolvedPath.startsWith(resolve(uploadsDir))) {
      return NextResponse.json(
        { error: "Invalid file path detected" },
        { status: 400 }
      );
    }

    // Save processed and validated image
    await writeFile(filePath, processedImage);

    const photoUrl = `/api/profile/photo/${fileName}`;

    return NextResponse.json({ photoUrl });
  } catch (error) {
    const errorMessage =
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : error instanceof Error
        ? error.message
        : "Internal server error";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
