import { describe, it, expect } from "vitest";
import { FileValidator } from "@/shared/validation/file.validators";
import {
  PROFILE_VALIDATION,
  PROFILE_ERROR_MESSAGES,
} from "@/shared/validation/profile.constants";

function createMockFile(
  name: string,
  size: number,
  type: string
): File {
  const buffer = new ArrayBuffer(size);
  return new File([buffer], name, { type });
}

describe("FileValidator.validatePhoto", () => {
  it("should accept valid JPEG file", () => {
    const file = createMockFile("photo.jpg", 1024 * 1024, "image/jpeg");
    const result = FileValidator.validatePhoto(file);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("should accept valid JPG file", () => {
    const file = createMockFile("photo.jpg", 1024 * 1024, "image/jpg");
    const result = FileValidator.validatePhoto(file);
    expect(result.valid).toBe(true);
  });

  it("should accept valid PNG file", () => {
    const file = createMockFile("photo.png", 1024 * 1024, "image/png");
    const result = FileValidator.validatePhoto(file);
    expect(result.valid).toBe(true);
  });

  it("should reject file exceeding max size", () => {
    const oversized = PROFILE_VALIDATION.photo.maxSizeBytes + 1;
    const file = createMockFile("large.jpg", oversized, "image/jpeg");
    const result = FileValidator.validatePhoto(file);
    expect(result.valid).toBe(false);
    expect(result.error).toBe(PROFILE_ERROR_MESSAGES.photo.size);
  });

  it("should accept file at exactly max size", () => {
    const file = createMockFile(
      "exact.jpg",
      PROFILE_VALIDATION.photo.maxSizeBytes,
      "image/jpeg"
    );
    const result = FileValidator.validatePhoto(file);
    expect(result.valid).toBe(true);
  });

  it("should reject unsupported file type (GIF)", () => {
    const file = createMockFile("anim.gif", 1024, "image/gif");
    const result = FileValidator.validatePhoto(file);
    expect(result.valid).toBe(false);
    expect(result.error).toBe(PROFILE_ERROR_MESSAGES.photo.type);
  });

  it("should reject unsupported file type (WebP)", () => {
    const file = createMockFile("photo.webp", 1024, "image/webp");
    const result = FileValidator.validatePhoto(file);
    expect(result.valid).toBe(false);
    expect(result.error).toBe(PROFILE_ERROR_MESSAGES.photo.type);
  });

  it("should reject non-image file type", () => {
    const file = createMockFile("doc.pdf", 1024, "application/pdf");
    const result = FileValidator.validatePhoto(file);
    expect(result.valid).toBe(false);
    expect(result.error).toBe(PROFILE_ERROR_MESSAGES.photo.type);
  });

  it("should check size before type", () => {
    const oversized = PROFILE_VALIDATION.photo.maxSizeBytes + 1;
    const file = createMockFile("large.gif", oversized, "image/gif");
    const result = FileValidator.validatePhoto(file);
    expect(result.valid).toBe(false);
    expect(result.error).toBe(PROFILE_ERROR_MESSAGES.photo.size);
  });
});
