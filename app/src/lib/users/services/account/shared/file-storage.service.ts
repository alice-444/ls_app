import { unlink, writeFile, mkdir } from "fs/promises";
import { resolve, join } from "path";
import { existsSync } from "fs";
import { randomUUID } from "crypto";
import type {
  IFileStorageService,
  FileUploadOptions,
} from "./file-storage.service.interface";
import { Result, failure, success } from "../../../../common";

export class LocalFileStorageService implements IFileStorageService {
  private readonly uploadsDir: string;

  constructor(uploadsDir?: string) {
    this.uploadsDir =
      uploadsDir || resolve(process.cwd(), "uploads", "profiles");
  }

  async uploadFile(
    file: Buffer | string,
    options?: FileUploadOptions,
  ): Promise<Result<{ url: string }>> {
    try {
      if (!existsSync(this.uploadsDir)) {
        await mkdir(this.uploadsDir, { recursive: true });
      }

      const fileExtension = "jpg"; // Default
      const fileName = options?.publicId
        ? `${options.publicId}.${fileExtension}`
        : `${randomUUID()}.${fileExtension}`;

      const filePath = join(this.uploadsDir, fileName);

      const buffer = Buffer.isBuffer(file)
        ? file
        : Buffer.from(file.replace(/^data:image\/\w+;base64,/, ""), "base64");

      await writeFile(filePath, buffer);

      // In local dev, we return a path that our API can serve
      const relativePath = `/api/profile/photo/${fileName}`;
      return success({ url: relativePath });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return failure(`Failed to upload file locally: ${errorMessage}`, 500);
    }
  }

  async deleteFile(filePath: string): Promise<Result<{ success: boolean }>> {
    try {
      // If it's a full API URL, extract the filename
      const fileName = filePath.split("/").pop();
      if (!fileName) return failure("Invalid file path", 400);

      const fullPath = join(this.uploadsDir, fileName);
      const resolvedUploadsDir = resolve(this.uploadsDir);

      if (!resolve(fullPath).startsWith(resolvedUploadsDir)) {
        return failure("Invalid file path: outside uploads directory", 400);
      }

      if (!existsSync(fullPath)) {
        return success({ success: true });
      }

      await unlink(fullPath);
      return success({ success: true });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return failure(`Failed to delete file: ${errorMessage}`, 500);
    }
  }

  async fileExists(filePath: string): Promise<Result<{ exists: boolean }>> {
    try {
      const fileName = filePath.split("/").pop();
      if (!fileName) return failure("Invalid file path", 400);

      const fullPath = join(this.uploadsDir, fileName);
      const exists = existsSync(fullPath);
      return success({ exists });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return failure(`Failed to check file existence: ${errorMessage}`, 500);
    }
  }
}
