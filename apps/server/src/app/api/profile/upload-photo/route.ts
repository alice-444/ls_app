import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join, resolve, normalize } from "path";
import { existsSync } from "fs";
import { randomUUID } from "crypto";
import { fileTypeFromBuffer } from "file-type";
import { uploadRateLimit } from "@/lib/rate-limit";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png"];

export async function POST(req: NextRequest) {
  try {
    // Retrieve the user's session
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting
    const identifier = session.user.id;
    const { success, limit, reset, remaining } = await uploadRateLimit.limit(identifier);

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

    // Create uploads directory if it doesn't exist
    const uploadsDir = resolve(process.cwd(), "public", "uploads", "profiles");
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

    // Save file
    await writeFile(filePath, buffer);

    const photoUrl = `/uploads/profiles/${fileName}`;

    return NextResponse.json({ photoUrl });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
