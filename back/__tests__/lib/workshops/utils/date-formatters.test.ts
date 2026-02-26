import { describe, it, expect } from "vitest";
import {
  formatDate,
  formatTime,
  formatDateTime,
} from "../../../../src/lib/workshops/utils/date-formatters";

describe("formatDate", () => {
  it('returns "Non définie" for null', () => {
    expect(formatDate(null)).toBe("Non définie");
  });

  it("formats a date in French locale", () => {
    const date = new Date(2026, 1, 26);
    const result = formatDate(date);
    expect(result).toContain("2026");
    expect(result).toContain("26");
  });

  it("includes weekday when option is set", () => {
    const date = new Date(2026, 1, 26);
    const result = formatDate(date, { includeWeekday: true });
    expect(result.length).toBeGreaterThan(formatDate(date).length);
  });
});

describe("formatTime", () => {
  it('returns "Non définie" for null', () => {
    expect(formatTime(null)).toBe("Non définie");
  });

  it("returns the time string as-is", () => {
    expect(formatTime("14:30")).toBe("14:30");
  });
});

describe("formatDateTime", () => {
  it('returns "Non défini" when date is null', () => {
    expect(formatDateTime(null, "14:00")).toBe("Non défini");
  });

  it('returns "Non défini" when time is null', () => {
    expect(formatDateTime(new Date(), null)).toBe("Non défini");
  });

  it('returns "Non défini" when both are null', () => {
    expect(formatDateTime(null, null)).toBe("Non défini");
  });

  it("combines date and time with 'à'", () => {
    const date = new Date(2026, 1, 26);
    const result = formatDateTime(date, "14:30");
    expect(result).toContain("à");
    expect(result).toContain("14:30");
    expect(result).toContain("2026");
  });
});
