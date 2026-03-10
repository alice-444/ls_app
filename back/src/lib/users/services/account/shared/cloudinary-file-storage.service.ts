import { v2 as cloudinary } from "cloudinary";
import type { IFileStorageService, FileUploadOptions } from "./file-storage.service.interface";
import { Result, failure, success } from "../../../../common";

export class CloudinaryFileStorageService implements IFileStorageService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }

  async uploadFile(
    file: Buffer | string,
    options?: FileUploadOptions
  ): Promise<Result<{ url: string }>> {
    try {
      if (!process.env.CLOUDINARY_CLOUD_NAME) {
        return failure("Cloudinary configuration missing", 500);
      }

      // Convert buffer to base64 if needed
      const fileToUpload = Buffer.isBuffer(file) 
        ? `data:image/jpeg;base64,${file.toString('base64')}` 
        : file;

      const uploadResponse = await cloudinary.uploader.upload(fileToUpload, {
        folder: options?.folder || "learnsup/profiles",
        public_id: options?.publicId,
        tags: options?.tags,
        resource_type: "auto",
      });

      return success({ url: uploadResponse.secure_url });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown Cloudinary error";
      return failure(`Failed to upload file to Cloudinary: ${errorMessage}`, 500);
    }
  }

  async deleteFile(fileIdentifier: string): Promise<Result<{ success: boolean }>> {
    try {
      // If it's a URL, we might need to extract the public ID
      let publicId = fileIdentifier;
      if (fileIdentifier.startsWith("http")) {
        // Extract public ID from URL: e.g. https://res.cloudinary.com/cloud/image/upload/v1/folder/id.jpg -> folder/id
        const parts = fileIdentifier.split("/");
        const filenameWithExt = parts[parts.length - 1];
        const filename = filenameWithExt.split(".")[0];
        
        // Find "upload" in the URL and take everything after the version (v12345678)
        const uploadIndex = parts.indexOf("upload");
        if (uploadIndex !== -1 && parts.length > uploadIndex + 2) {
          const pathParts = parts.slice(uploadIndex + 2); // skip "upload" and "vXXXXX"
          const pathWithoutExt = pathParts.join("/").split(".")[0];
          publicId = pathWithoutExt;
        } else {
          publicId = filename;
        }
      }

      await cloudinary.uploader.destroy(publicId);
      return success({ success: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown Cloudinary error";
      return failure(`Failed to delete file from Cloudinary: ${errorMessage}`, 500);
    }
  }

  async fileExists(fileIdentifier: string): Promise<Result<{ exists: boolean }>> {
    // Cloudinary doesn't have a simple "exists" method without using Admin API (which might be rate limited)
    // For now, we assume it exists if we have the URL
    return success({ exists: true });
  }
}
