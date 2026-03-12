import {
  PROFILE_VALIDATION,
  PROFILE_ERROR_MESSAGES,
} from "./profile.constants";

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export class FileValidator {
  static validatePhoto(file: File): FileValidationResult {
    if (file.size > PROFILE_VALIDATION.photo.maxSizeBytes) {
      return {
        valid: false,
        error: PROFILE_ERROR_MESSAGES.photo.size,
      };
    }

    if (
      !PROFILE_VALIDATION.photo.allowedTypes.includes(
        file.type as (typeof PROFILE_VALIDATION.photo.allowedTypes)[number],
      )
    ) {
      return {
        valid: false,
        error: PROFILE_ERROR_MESSAGES.photo.type,
      };
    }

    return { valid: true };
  }
}
