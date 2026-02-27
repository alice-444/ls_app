import { describe, it, expect } from "vitest";
import { PasswordValidator } from "../../../../src/shared/validation/password.validators";

describe("PasswordValidator.validate", () => {
  it("rejects a password shorter than 8 characters", () => {
    const result = PasswordValidator.validate("Ab1");
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("rejects a password without a digit", () => {
    const result = PasswordValidator.validate("abcdefgh");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("chiffre");
  });

  it("accepts a valid password", () => {
    const result = PasswordValidator.validate("abcdefg1");
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("accepts a long password with digits", () => {
    const result = PasswordValidator.validate("MyStr0ngP@ssword123");
    expect(result.valid).toBe(true);
  });
});

describe("PasswordValidator.validateMatch", () => {
  it("rejects mismatched passwords", () => {
    const result = PasswordValidator.validateMatch("password1", "password2");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("correspondent");
  });

  it("accepts matching passwords", () => {
    const result = PasswordValidator.validateMatch("password1", "password1");
    expect(result.valid).toBe(true);
  });
});

describe("PasswordValidator.validateComplete", () => {
  it("rejects when passwords don't match even if valid", () => {
    const result = PasswordValidator.validateComplete("abcdefg1", "abcdefg2");
    expect(result.valid).toBe(false);
  });

  it("rejects when passwords match but are too short", () => {
    const result = PasswordValidator.validateComplete("Ab1", "Ab1");
    expect(result.valid).toBe(false);
  });

  it("rejects when passwords match but have no digit", () => {
    const result = PasswordValidator.validateComplete("abcdefgh", "abcdefgh");
    expect(result.valid).toBe(false);
  });

  it("accepts matching valid passwords", () => {
    const result = PasswordValidator.validateComplete("abcdefg1", "abcdefg1");
    expect(result.valid).toBe(true);
  });
});
