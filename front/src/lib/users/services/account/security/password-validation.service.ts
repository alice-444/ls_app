import { PasswordValidator } from "@ls-app/shared";

export class PasswordValidationService {
  validate(password: string): { valid: boolean; error?: string } {
    return PasswordValidator.validate(password);
  }

  validateMatch(
    password: string,
    confirmPassword: string,
  ): {
    valid: boolean;
    error?: string;
  } {
    return PasswordValidator.validateMatch(password, confirmPassword);
  }
}
