import { Result, failure, success } from "../../common";
import { sanitizeString } from "../../utils/sanitize";

export class MessageValidationService {
  private static readonly MAX_MESSAGE_LENGTH = 5000;
  private static readonly MAX_EDIT_COUNT = 5;
  private static readonly EDIT_TIME_LIMIT_MS = 15 * 60 * 1000; // 15 minutes
  private static readonly DELETE_TIME_LIMIT_MS = 5 * 60 * 1000; // 5 minutes

  validateMessageContent(content: string): Result<string> {
    const trimmedContent = content.trim();
    if (!trimmedContent || trimmedContent.length === 0) {
      return failure("Message content cannot be empty", 400);
    }

    if (trimmedContent.length > MessageValidationService.MAX_MESSAGE_LENGTH) {
      return failure(
        `Message content cannot exceed ${MessageValidationService.MAX_MESSAGE_LENGTH} characters`,
        400
      );
    }

    return success(sanitizeString(trimmedContent));
  }

  canEditMessage(
    createdAt: Date,
    editCount: number,
    isSystemMessage: boolean
  ): Result<boolean> {
    if (isSystemMessage) {
      return failure("System messages cannot be edited", 403);
    }

    const messageAge = Date.now() - new Date(createdAt).getTime();
    if (messageAge > MessageValidationService.EDIT_TIME_LIMIT_MS) {
      return failure(
        "Messages can only be edited within 15 minutes of sending",
        403
      );
    }

    if (editCount >= MessageValidationService.MAX_EDIT_COUNT) {
      return failure(
        `Message has been edited ${MessageValidationService.MAX_EDIT_COUNT} times. No further edits allowed.`,
        403
      );
    }

    return success(true);
  }

  canDeleteMessage(createdAt: Date, isSystemMessage: boolean): Result<boolean> {
    if (isSystemMessage) {
      return failure("System messages cannot be deleted", 403);
    }

    const messageAge = Date.now() - new Date(createdAt).getTime();
    if (messageAge > MessageValidationService.DELETE_TIME_LIMIT_MS) {
      return failure(
        "Messages can only be deleted within 5 minutes of sending",
        403
      );
    }

    return success(true);
  }

  static getMaxMessageLength(): number {
    return MessageValidationService.MAX_MESSAGE_LENGTH;
  }

  static getMaxEditCount(): number {
    return MessageValidationService.MAX_EDIT_COUNT;
  }

  static getEditTimeLimitMs(): number {
    return MessageValidationService.EDIT_TIME_LIMIT_MS;
  }

  static getDeleteTimeLimitMs(): number {
    return MessageValidationService.DELETE_TIME_LIMIT_MS;
  }
}
