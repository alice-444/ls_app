import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join, resolve } from "path";
import { existsSync } from "fs";
import { getAuthenticatedSession } from "@/lib/api-helpers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const authResult = await getAuthenticatedSession(req);
    if (!authResult.ok) {
      return authResult.response;
    }

    const { filename } = await params;

    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "");
    if (sanitizedFilename !== filename) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    const uploadsDir = resolve(process.cwd(), "uploads", "support");
    const filePath = join(uploadsDir, sanitizedFilename);

    const resolvedPath = resolve(filePath);
    if (!resolvedPath.startsWith(resolve(uploadsDir))) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileBuffer = await readFile(filePath);

    const extension = sanitizedFilename.split(".").pop()?.toLowerCase() || "";
    let contentType = "application/octet-stream";
    if (extension === "pdf") contentType = "application/pdf";
    else if (["jpg", "jpeg"].includes(extension)) contentType = "image/jpeg";
    else if (extension === "png") contentType = "image/png";
    else if (extension === "txt") contentType = "text/plain";
    else if (extension === "doc") contentType = "application/msword";
    else if (extension === "docx")
      contentType =
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${sanitizedFilename}"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Error reading file" }, { status: 500 });
  }
}
