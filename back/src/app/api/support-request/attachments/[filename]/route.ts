import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { existsSync } from "node:fs";
import { getAuthenticatedSession } from "@/lib/api-helpers";
import { prisma } from "@/lib/common";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const authResult = await getAuthenticatedSession(req);
    if (!authResult.ok) {
      return authResult.response;
    }

    const appUser = await prisma.user.findUnique({
      where: { userId: authResult.userId },
    });

    if (!appUser || appUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { filename } = await params;

    const sanitizedFilename = filename.replaceAll(/[^a-zA-Z0-9._-]/, "");
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
