import {
  PROFILE_VALIDATION,
  PROFILE_ERROR_MESSAGES,
} from "./profile.constants";

export interface PasswordValidationResult {
  valid: boolean;
  error?: string;
}

export class PasswordValidator {
  static validate(password: string): PasswordValidationResult {
    if (password.length < PROFILE_VALIDATION.password.minLength) {
      return {
        valid: false,
        error: PROFILE_ERROR_MESSAGES.password.minLength,
      };
    }

    if (PROFILE_VALIDATION.password.requireNumber && !/\d/.test(password)) {
      return {
        valid: false,
        error: PROFILE_ERROR_MESSAGES.password.requireNumber,
      };
    }

    return { valid: true };
  }

  static validateMatch(
    password: string,
    confirmPassword: string,
  ): PasswordValidationResult {
    if (password !== confirmPassword) {
      return {
        valid: false,
        error: PROFILE_ERROR_MESSAGES.password.match,
      };
    }

    return { valid: true };
  }

  static validateComplete(
    password: string,
    confirmPassword: string,
  ): PasswordValidationResult {
    const matchResult = this.validateMatch(password, confirmPassword);
    if (!matchResult.valid) {
      return matchResult;
    }

    return this.validate(password);
  }
}
