import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  isMinimumTomorrow,
  getMinimumDate,
  formatDateForInput,
} from "@/shared/validation/date.validators";

describe("isMinimumTomorrow", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 5, 15, 12, 0, 0)); // June 15, 2025 12:00
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return false for null", () => {
    expect(isMinimumTomorrow(null)).toBe(false);
  });

  it("should return false for undefined", () => {
    expect(isMinimumTomorrow(undefined)).toBe(false);
  });

  it("should return false for today", () => {
    expect(isMinimumTomorrow(new Date(2025, 5, 15))).toBe(false);
  });

  it("should return false for a past date", () => {
    expect(isMinimumTomorrow(new Date(2025, 5, 10))).toBe(false);
  });

  it("should return true for tomorrow", () => {
    expect(isMinimumTomorrow(new Date(2025, 5, 16))).toBe(true);
  });

  it("should return true for a date far in the future", () => {
    expect(isMinimumTomorrow(new Date(2026, 0, 1))).toBe(true);
  });

  it("should work with string dates", () => {
    expect(isMinimumTomorrow("2025-06-20")).toBe(true);
    expect(isMinimumTomorrow("2025-06-14")).toBe(false);
  });
});

describe("getMinimumDate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 5, 15, 14, 30, 0)); // June 15, 2025 14:30
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return tomorrow at midnight", () => {
    const result = getMinimumDate();
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(5);
    expect(result.getDate()).toBe(16);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
  });
});

describe("formatDateForInput", () => {
  it("should format date as YYYY-MM-DD", () => {
    const date = new Date(Date.UTC(2025, 5, 15, 12, 0, 0));
    const result = formatDateForInput(date);
    expect(result).toBe("2025-06-15");
  });

  it("should pad single digit months and days", () => {
    const date = new Date(Date.UTC(2025, 0, 5, 12, 0, 0));
    const result = formatDateForInput(date);
    expect(result).toBe("2025-01-05");
  });

  it("should handle end of year", () => {
    const date = new Date(Date.UTC(2025, 11, 31, 12, 0, 0));
    const result = formatDateForInput(date);
    expect(result).toBe("2025-12-31");
  });

  it("should return string in YYYY-MM-DD format", () => {
    const date = new Date(Date.UTC(2025, 7, 9, 12, 0, 0));
    const result = formatDateForInput(date);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
