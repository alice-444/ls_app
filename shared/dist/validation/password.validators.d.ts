export interface PasswordValidationResult {
  valid: boolean;
  error?: string;
}
export declare class PasswordValidator {
  static validate(password: string): PasswordValidationResult;
  static validateMatch(
    password: string,
    confirmPassword: string,
  ): PasswordValidationResult;
  static validateComplete(
    password: string,
    confirmPassword: string,
  ): PasswordValidationResult;
}
