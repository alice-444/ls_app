import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  formatDate,
  formatTime,
  isValidTimeFormat,
  calculateEndTime,
  formatTimeRange,
  calculateCountdown,
  formatCountdown,
} from "@/lib/workshop-utils";

describe("formatDate", () => {
  it("should return 'Non définie' for null", () => {
    expect(formatDate(null)).toBe("Non définie");
  });

  it("should format a string date in French locale", () => {
    const result = formatDate("2025-06-15");
    expect(result).toContain("2025");
  });

  it("should format a Date object", () => {
    const result = formatDate(new Date(2025, 5, 15));
    expect(result).toContain("15");
    expect(result).toContain("2025");
  });

  it("should include weekday when option is set", () => {
    const result = formatDate("2025-06-15", { includeWeekday: true });
    expect(result.length).toBeGreaterThan(
      formatDate("2025-06-15").length
    );
  });
});

describe("formatTime", () => {
  it("should return 'Non définie' for null", () => {
    expect(formatTime(null)).toBe("Non définie");
  });

  it("should return the time string as-is", () => {
    expect(formatTime("14:30")).toBe("14:30");
  });
});

describe("isValidTimeFormat", () => {
  it("should accept valid HH:MM format", () => {
    expect(isValidTimeFormat("00:00")).toBe(true);
    expect(isValidTimeFormat("09:30")).toBe(true);
    expect(isValidTimeFormat("14:45")).toBe(true);
    expect(isValidTimeFormat("23:59")).toBe(true);
  });

  it("should reject invalid time formats", () => {
    expect(isValidTimeFormat("24:00")).toBe(false);
    expect(isValidTimeFormat("25:00")).toBe(false);
    expect(isValidTimeFormat("12:60")).toBe(false);
    expect(isValidTimeFormat("1:30")).toBe(false);
    expect(isValidTimeFormat("abc")).toBe(false);
    expect(isValidTimeFormat("")).toBe(false);
  });
});

describe("calculateEndTime", () => {
  it("should return null when date is null", () => {
    expect(calculateEndTime(null, "10:00", 60)).toBeNull();
  });

  it("should return null when time is null", () => {
    expect(calculateEndTime("2025-06-15", null, 60)).toBeNull();
  });

  it("should return null when duration is null", () => {
    expect(calculateEndTime("2025-06-15", "10:00", null)).toBeNull();
  });

  it("should calculate end time correctly with 60min duration", () => {
    const result = calculateEndTime(new Date(2025, 5, 15), "10:00", 60);
    expect(result).not.toBeNull();
    expect(result!.getHours()).toBe(11);
    expect(result!.getMinutes()).toBe(0);
  });

  it("should calculate end time crossing hour boundary", () => {
    const result = calculateEndTime(new Date(2025, 5, 15), "10:45", 30);
    expect(result).not.toBeNull();
    expect(result!.getHours()).toBe(11);
    expect(result!.getMinutes()).toBe(15);
  });

  it("should work with string date", () => {
    const result = calculateEndTime("2025-06-15", "14:00", 120);
    expect(result).not.toBeNull();
    expect(result!.getHours()).toBe(16);
  });
});

describe("formatTimeRange", () => {
  it("should return 'Non définie' for null time", () => {
    expect(formatTimeRange(null, 60)).toBe("Non définie");
  });

  it("should return time only when duration is null", () => {
    expect(formatTimeRange("10:00", null)).toBe("10:00");
  });

  it("should return time only when duration is 0", () => {
    expect(formatTimeRange("10:00", 0)).toBe("10:00");
  });

  it("should format time range correctly", () => {
    expect(formatTimeRange("10:00", 60)).toBe("10:00 - 11:00");
  });

  it("should handle crossing hour boundary", () => {
    expect(formatTimeRange("10:45", 30)).toBe("10:45 - 11:15");
  });

  it("should handle multi-hour duration", () => {
    expect(formatTimeRange("09:00", 150)).toBe("09:00 - 11:30");
  });

  it("should pad hours and minutes with zeros", () => {
    expect(formatTimeRange("08:00", 30)).toBe("08:00 - 08:30");
  });
});

describe("calculateCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 5, 15, 10, 0, 0)); // June 15, 2025 10:00:00
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return null for null date", () => {
    expect(calculateCountdown(null, "14:00")).toBeNull();
  });

  it("should return null for null time", () => {
    expect(calculateCountdown("2025-06-15", null)).toBeNull();
  });

  it("should return isPast=true when workshop is in the past", () => {
    const result = calculateCountdown(new Date(2025, 5, 15), "08:00");
    expect(result).not.toBeNull();
    expect(result!.isPast).toBe(true);
    expect(result!.days).toBe(0);
    expect(result!.hours).toBe(0);
    expect(result!.minutes).toBe(0);
    expect(result!.seconds).toBe(0);
  });

  it("should calculate countdown for future workshop same day", () => {
    const result = calculateCountdown(new Date(2025, 5, 15), "14:00");
    expect(result).not.toBeNull();
    expect(result!.isPast).toBe(false);
    expect(result!.hours).toBe(4);
    expect(result!.minutes).toBe(0);
    expect(result!.days).toBe(0);
  });

  it("should calculate countdown for workshop days away", () => {
    const result = calculateCountdown(new Date(2025, 5, 18), "10:00");
    expect(result).not.toBeNull();
    expect(result!.isPast).toBe(false);
    expect(result!.days).toBe(3);
  });
});

describe("formatCountdown", () => {
  it("should return 'Date non définie' for null", () => {
    expect(formatCountdown(null)).toBe("Date non définie");
  });

  it("should return 'Terminé' when isPast", () => {
    expect(
      formatCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true })
    ).toBe("Terminé");
  });

  it("should format days (singular)", () => {
    expect(
      formatCountdown({ days: 1, hours: 2, minutes: 30, seconds: 0, isPast: false })
    ).toBe("1 jour");
  });

  it("should format days (plural)", () => {
    expect(
      formatCountdown({ days: 3, hours: 2, minutes: 30, seconds: 0, isPast: false })
    ).toBe("3 jours");
  });

  it("should format hours when no days", () => {
    expect(
      formatCountdown({ days: 0, hours: 5, minutes: 30, seconds: 0, isPast: false })
    ).toBe("5 heures");
  });

  it("should format hour (singular)", () => {
    expect(
      formatCountdown({ days: 0, hours: 1, minutes: 30, seconds: 0, isPast: false })
    ).toBe("1 heure");
  });

  it("should format minutes when no days or hours", () => {
    expect(
      formatCountdown({ days: 0, hours: 0, minutes: 45, seconds: 10, isPast: false })
    ).toBe("45 minutes");
  });

  it("should format minute (singular)", () => {
    expect(
      formatCountdown({ days: 0, hours: 0, minutes: 1, seconds: 10, isPast: false })
    ).toBe("1 minute");
  });

  it("should format seconds when no other units", () => {
    expect(
      formatCountdown({ days: 0, hours: 0, minutes: 0, seconds: 30, isPast: false })
    ).toBe("30 secondes");
  });

  it("should format second (singular)", () => {
    expect(
      formatCountdown({ days: 0, hours: 0, minutes: 0, seconds: 1, isPast: false })
    ).toBe("1 seconde");
  });
});
