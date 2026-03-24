import type { Result } from "../../../../common";

export interface FileUploadOptions {
  folder?: string;
  publicId?: string;
  tags?: string[];
}

export interface IFileStorageService {
  /**
   * Uploads a file to storage
   * @param file Buffer or base64 string
   * @param options Upload configuration
   * @returns The URL of the uploaded file
   */
  uploadFile(file: Buffer | string, options?: FileUploadOptions): Promise<Result<{ url: string }>>;

  /**
   * Deletes a file from storage
   * @param fileIdentifier File path or public ID
   */
  deleteFile(fileIdentifier: string): Promise<Result<{ success: boolean }>>;

  /**
   * Checks if a file exists in storage
   */
  fileExists(fileIdentifier: string): Promise<Result<{ exists: boolean }>>;
}
