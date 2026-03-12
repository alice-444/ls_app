import { describe, it, expect } from "vitest";
import {
  PasswordValidator,
  PROFILE_VALIDATION,
  PROFILE_ERROR_MESSAGES,
} from "@ls-app/shared";

describe("PasswordValidator.validate", () => {
  it("should reject password shorter than minLength", () => {
    const result = PasswordValidator.validate("Ab1");
    expect(result.valid).toBe(false);
    expect(result.error).toBe(PROFILE_ERROR_MESSAGES.password.minLength);
  });

  it("should reject password at minLength - 1", () => {
    const shortPwd = "A".repeat(PROFILE_VALIDATION.password.minLength - 1);
    const result = PasswordValidator.validate(shortPwd);
    expect(result.valid).toBe(false);
  });

  it("should reject password without a number", () => {
    const result = PasswordValidator.validate("Abcdefgh");
    expect(result.valid).toBe(false);
    expect(result.error).toBe(PROFILE_ERROR_MESSAGES.password.requireNumber);
  });

  it("should accept valid password", () => {
    const result = PasswordValidator.validate("Abcdefg1");
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("should accept password at exact minLength with number", () => {
    const pwd = "A".repeat(PROFILE_VALIDATION.password.minLength - 1) + "1";
    const result = PasswordValidator.validate(pwd);
    expect(result.valid).toBe(true);
  });
});

describe("PasswordValidator.validateMatch", () => {
  it("should reject mismatched passwords", () => {
    const result = PasswordValidator.validateMatch("password1", "password2");
    expect(result.valid).toBe(false);
    expect(result.error).toBe(PROFILE_ERROR_MESSAGES.password.match);
  });

  it("should accept matching passwords", () => {
    const result = PasswordValidator.validateMatch("password1", "password1");
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("should be case-sensitive", () => {
    const result = PasswordValidator.validateMatch("Password1", "password1");
    expect(result.valid).toBe(false);
  });
});

describe("PasswordValidator.validateComplete", () => {
  it("should reject if passwords don't match", () => {
    const result = PasswordValidator.validateComplete(
      "ValidPass1",
      "DifferentPass1",
    );
    expect(result.valid).toBe(false);
    expect(result.error).toBe(PROFILE_ERROR_MESSAGES.password.match);
  });

  it("should reject if password is too short (even if matching)", () => {
    const result = PasswordValidator.validateComplete("Ab1", "Ab1");
    expect(result.valid).toBe(false);
    expect(result.error).toBe(PROFILE_ERROR_MESSAGES.password.minLength);
  });

  it("should reject if password has no number (even if matching)", () => {
    const result = PasswordValidator.validateComplete("Abcdefgh", "Abcdefgh");
    expect(result.valid).toBe(false);
    expect(result.error).toBe(PROFILE_ERROR_MESSAGES.password.requireNumber);
  });

  it("should accept valid matching passwords", () => {
    const result = PasswordValidator.validateComplete(
      "ValidPass1",
      "ValidPass1",
    );
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });
});
