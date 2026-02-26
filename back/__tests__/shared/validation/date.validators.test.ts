import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  isMinimumTomorrow,
  getMinimumDate,
  formatDateForInput,
} from "../../../src/shared/validation/date.validators";

describe("isMinimumTomorrow", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-26T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns true for null or undefined", () => {
    expect(isMinimumTomorrow(null)).toBe(true);
    expect(isMinimumTomorrow(undefined)).toBe(true);
  });

  it("returns false for a date in the past", () => {
    expect(isMinimumTomorrow(new Date("2026-02-20"))).toBe(false);
  });

  it("returns false for today", () => {
    expect(isMinimumTomorrow(new Date("2026-02-26"))).toBe(false);
  });

  it("returns true for tomorrow", () => {
    expect(isMinimumTomorrow(new Date("2026-02-27"))).toBe(true);
  });

  it("returns true for a date far in the future", () => {
    expect(isMinimumTomorrow(new Date("2030-01-01"))).toBe(true);
  });

  it("accepts ISO string dates", () => {
    expect(isMinimumTomorrow("2026-02-20")).toBe(false);
    expect(isMinimumTomorrow("2026-02-27")).toBe(true);
  });
});

describe("getMinimumDate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-26T15:30:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns tomorrow at midnight", () => {
    const result = getMinimumDate();
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(27);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
  });
});

describe("formatDateForInput", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-26T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("formats a specific date as YYYY-MM-DD", () => {
    const date = new Date("2026-03-15T00:00:00Z");
    expect(formatDateForInput(date)).toBe("2026-03-15");
  });

  it("uses getMinimumDate by default", () => {
    const result = formatDateForInput();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
