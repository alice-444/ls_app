import { describe, it, expect } from "vitest";
import { PROFILE_VALIDATION, PROFILE_ERROR_MESSAGES } from "@ls-app/shared";

describe("PROFILE_VALIDATION", () => {
  it("should have name with min and max", () => {
    expect(PROFILE_VALIDATION.name.min).toBeGreaterThan(0);
    expect(PROFILE_VALIDATION.name.max).toBeGreaterThan(
      PROFILE_VALIDATION.name.min,
    );
  });

  it("should have bio with max", () => {
    expect(PROFILE_VALIDATION.bio.max).toBeGreaterThan(0);
  });

  it("should have photo config with correct maxSizeBytes", () => {
    expect(PROFILE_VALIDATION.photo.maxSizeMB).toBe(2);
    expect(PROFILE_VALIDATION.photo.maxSizeBytes).toBe(2 * 1024 * 1024);
  });

  it("should have allowed photo types including jpeg, jpg, png", () => {
    expect(PROFILE_VALIDATION.photo.allowedTypes).toContain("image/jpeg");
    expect(PROFILE_VALIDATION.photo.allowedTypes).toContain("image/jpg");
    expect(PROFILE_VALIDATION.photo.allowedTypes).toContain("image/png");
  });

  it("should not allow gif or webp", () => {
    const types = PROFILE_VALIDATION.photo.allowedTypes as readonly string[];
    expect(types).not.toContain("image/gif");
    expect(types).not.toContain("image/webp");
  });

  it("should have password config", () => {
    expect(PROFILE_VALIDATION.password.minLength).toBeGreaterThan(0);
    expect(PROFILE_VALIDATION.password.requireNumber).toBe(true);
  });
});

describe("PROFILE_ERROR_MESSAGES", () => {
  it("should have error messages for name", () => {
    expect(PROFILE_ERROR_MESSAGES.name.min).toBeTruthy();
    expect(PROFILE_ERROR_MESSAGES.name.max).toBeTruthy();
  });

  it("should have error message for bio", () => {
    expect(PROFILE_ERROR_MESSAGES.bio.max).toBeTruthy();
  });

  it("should have error messages for photo", () => {
    expect(PROFILE_ERROR_MESSAGES.photo.size).toBeTruthy();
    expect(PROFILE_ERROR_MESSAGES.photo.type).toBeTruthy();
  });

  it("should have error messages for password", () => {
    expect(PROFILE_ERROR_MESSAGES.password.minLength).toBeTruthy();
    expect(PROFILE_ERROR_MESSAGES.password.requireNumber).toBeTruthy();
    expect(PROFILE_ERROR_MESSAGES.password.match).toBeTruthy();
  });
});
