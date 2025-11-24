import type { Result } from "../../common";

export interface IMessageValidationService {
  validateMessageContent(content: string): Result<string>;
  canEditMessage(
    createdAt: Date,
    editCount: number,
    isSystemMessage: boolean
  ): Result<boolean>;
  canDeleteMessage(createdAt: Date, isSystemMessage: boolean): Result<boolean>;
}

