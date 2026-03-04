import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join, resolve } from "path";
import { existsSync } from "fs";
import { getAuthenticatedSession, handleRouteError } from "@/lib/api-helpers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    const sanitizedFilename = filename.replaceAll(/[^a-zA-Z0-9._-]/, "");
    if (sanitizedFilename !== filename) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    const uuidPattern =
      /^(.+)-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\.(jpg|jpeg|png)$/i;
    const match = sanitizedFilename.match(uuidPattern);

    if (!match) {
      return NextResponse.json(
        { error: "Invalid file name format" },
        { status: 400 }
      );
    }

    const extension = match[3].toLowerCase();

    // Construct file path
    const uploadsDir = resolve(process.cwd(), "uploads", "profiles");
    const filePath = join(uploadsDir, sanitizedFilename);

    // Verify path is within uploadsDir (prevent path traversal)
    const resolvedPath = resolve(filePath);
    if (!resolvedPath.startsWith(resolve(uploadsDir))) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Read and serve the file
    const fileBuffer = await readFile(filePath);

    // Determine content type
    const contentType = extension === "png" ? "image/png" : "image/jpeg";

    // Return file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
