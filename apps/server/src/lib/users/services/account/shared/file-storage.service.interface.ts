import type { Result } from "../../../../common";

export interface IFileStorageService {
  deleteFile(filePath: string): Promise<Result<{ success: boolean }>>;

  fileExists(filePath: string): Promise<Result<{ exists: boolean }>>;
}
