import { unlink } from "fs/promises";
import { resolve } from "path";
import { existsSync } from "fs";
import type { IFileStorageService } from "./file-storage.service.interface";
import { Result, failure, success } from "../../../../common";

export class LocalFileStorageService implements IFileStorageService {
  private readonly uploadsDir: string;

  constructor(uploadsDir?: string) {
    this.uploadsDir =
      uploadsDir || resolve(process.cwd(), "uploads", "profiles");
  }

  async deleteFile(filePath: string): Promise<Result<{ success: boolean }>> {
    try {
      if (!filePath.startsWith("/uploads/")) {
        return failure("Invalid file path: must start with /uploads/", 400);
      }

      const fullPath = resolve(process.cwd(), filePath.substring(1));
      const resolvedUploadsDir = resolve(this.uploadsDir);

      if (!fullPath.startsWith(resolvedUploadsDir)) {
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
      if (!filePath.startsWith("/uploads/")) {
        return failure("Invalid file path: must start with /uploads/", 400);
      }

      const fullPath = resolve(process.cwd(), filePath.substring(1));
      const resolvedUploadsDir = resolve(this.uploadsDir);

      if (!fullPath.startsWith(resolvedUploadsDir)) {
        return failure("Invalid file path: outside uploads directory", 400);
      }

      const exists = existsSync(fullPath);
      return success({ exists });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return failure(`Failed to check file existence: ${errorMessage}`, 500);
    }
  }
}
