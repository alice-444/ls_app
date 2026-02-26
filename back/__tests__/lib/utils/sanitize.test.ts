import { describe, it, expect } from "vitest";
import {
  sanitizeString,
  sanitizeStringWithTruncate,
  sanitizeStrings,
} from "../../../src/lib/utils/sanitize";

describe("sanitizeString", () => {
  it("strips HTML tags and keeps text content", () => {
    expect(sanitizeString("<b>hello</b>")).toBe("hello");
  });

  it("strips script tags", () => {
    expect(sanitizeString('<script>alert("xss")</script>safe')).toBe("safe");
  });

  it("trims whitespace by default", () => {
    expect(sanitizeString("  hello  ")).toBe("hello");
  });

  it("does not trim when trim option is false", () => {
    const result = sanitizeString("  hello  ", { trim: false });
    expect(result).toBe("  hello  ");
  });

  it("throws on null input", () => {
    expect(() => sanitizeString(null as any)).toThrow(
      "Input cannot be null or undefined"
    );
  });

  it("throws on undefined input", () => {
    expect(() => sanitizeString(undefined as any)).toThrow(
      "Input cannot be null or undefined"
    );
  });

  it("throws when sanitized string exceeds maxLength", () => {
    expect(() => sanitizeString("a long string", { maxLength: 5 })).toThrow(
      "exceeds maximum length"
    );
  });

  it("does not throw when string is within maxLength", () => {
    expect(sanitizeString("hello", { maxLength: 10 })).toBe("hello");
  });

  it("returns empty string for empty input", () => {
    expect(sanitizeString("")).toBe("");
  });

  it("handles nested HTML", () => {
    expect(sanitizeString("<div><p>text</p></div>")).toBe("text");
  });
});

describe("sanitizeStringWithTruncate", () => {
  it("returns empty string for null", () => {
    expect(sanitizeStringWithTruncate(null, 100)).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(sanitizeStringWithTruncate(undefined, 100)).toBe("");
  });

  it("truncates string exceeding maxLength", () => {
    expect(sanitizeStringWithTruncate("abcdefghij", 5)).toBe("abcde");
  });

  it("returns full string when within maxLength", () => {
    expect(sanitizeStringWithTruncate("hello", 10)).toBe("hello");
  });

  it("strips HTML before truncating", () => {
    expect(sanitizeStringWithTruncate("<b>hello world</b>", 5)).toBe("hello");
  });

  it("trims by default", () => {
    expect(sanitizeStringWithTruncate("  hi  ", 100)).toBe("hi");
  });

  it("does not trim when trim is false", () => {
    expect(sanitizeStringWithTruncate("  hi  ", 100, false)).toBe("  hi  ");
  });
});

describe("sanitizeStrings", () => {
  it("sanitizes all non-null values in a record", () => {
    const result = sanitizeStrings({
      name: "<b>John</b>",
      bio: "  Hello  ",
    });
    expect(result.name).toBe("John");
    expect(result.bio).toBe("Hello");
  });

  it("skips null and undefined values", () => {
    const result = sanitizeStrings({
      name: "John",
      bio: null,
      other: undefined,
    });
    expect(result).toEqual({ name: "John" });
    expect(result.bio).toBeUndefined();
    expect(result.other).toBeUndefined();
  });

  it("returns empty object for all null values", () => {
    const result = sanitizeStrings({ a: null, b: undefined });
    expect(result).toEqual({});
  });
});
