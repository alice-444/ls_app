import { describe, it, expect, vi } from "vitest";
import {
  isValidTimeFormat,
  sanitizeLocation,
  doTimeRangesOverlap,
  calculateWorkshopStartTime,
  calculateWorkshopEndTime,
  isWorkshopValidForConflictCheck,
  calculateWorkshopTimeRange,
  buildWorkshopUpdateData,
} from "../../../../../src/lib/workshops/utils/workshop-helpers";

vi.mock("../../../../../src/lib/common/logger", () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

describe("isValidTimeFormat", () => {
  it.each(["00:00", "09:30", "12:00", "23:59", "0:00", "9:05"])(
    "accepts valid time %s",
    (time) => {
      expect(isValidTimeFormat(time)).toBe(true);
    }
  );

  it.each(["25:00", "24:00", "12:60", "abc", "", "12:5a", "12:345"])(
    "rejects invalid time %s",
    (time) => {
      expect(isValidTimeFormat(time)).toBe(false);
    }
  );
});

describe("sanitizeLocation", () => {
  it("returns null for null input", () => {
    expect(sanitizeLocation(null)).toBeNull();
  });

  it("returns null for undefined input", () => {
    expect(sanitizeLocation(undefined)).toBeNull();
  });

  it("sanitizes a valid location string", () => {
    expect(sanitizeLocation("  Salle 101  ")).toBe("Salle 101");
  });

  it("strips HTML from location", () => {
    expect(sanitizeLocation("<b>Room</b> A")).toBe("Room A");
  });
});

describe("doTimeRangesOverlap", () => {
  const d = (h: number, m: number = 0) => new Date(2026, 1, 26, h, m);

  it("detects overlap when range1 starts during range2", () => {
    expect(doTimeRangesOverlap(d(10), d(12), d(9), d(11))).toBe(true);
  });

  it("detects overlap when range1 ends during range2", () => {
    expect(doTimeRangesOverlap(d(8), d(10), d(9), d(11))).toBe(true);
  });

  it("detects overlap when range1 contains range2", () => {
    expect(doTimeRangesOverlap(d(8), d(14), d(9), d(11))).toBe(true);
  });

  it("detects overlap when range1 is contained by range2", () => {
    expect(doTimeRangesOverlap(d(9), d(11), d(8), d(14))).toBe(true);
  });

  it("detects overlap when ranges are identical", () => {
    expect(doTimeRangesOverlap(d(10), d(12), d(10), d(12))).toBe(true);
  });

  it("returns false when range1 is entirely before range2", () => {
    expect(doTimeRangesOverlap(d(8), d(9), d(10), d(12))).toBe(false);
  });

  it("returns false when range1 is entirely after range2", () => {
    expect(doTimeRangesOverlap(d(13), d(15), d(10), d(12))).toBe(false);
  });

  it("returns false when range1 ends exactly at range2 start", () => {
    expect(doTimeRangesOverlap(d(8), d(10), d(10), d(12))).toBe(false);
  });

  it("returns false when range1 starts exactly at range2 end", () => {
    expect(doTimeRangesOverlap(d(12), d(14), d(10), d(12))).toBe(false);
  });
});

describe("calculateWorkshopStartTime", () => {
  it("returns correct start time from date and time string", () => {
    const date = new Date(2026, 1, 26);
    const result = calculateWorkshopStartTime(date, "14:30");
    expect(result).not.toBeNull();
    expect(result!.getHours()).toBe(14);
    expect(result!.getMinutes()).toBe(30);
    expect(result!.getSeconds()).toBe(0);
  });

  it("returns null when date is null", () => {
    expect(calculateWorkshopStartTime(null, "14:30")).toBeNull();
  });

  it("returns null when time is null", () => {
    expect(calculateWorkshopStartTime(new Date(), null)).toBeNull();
  });
});

describe("calculateWorkshopEndTime", () => {
  it("returns correct end time with duration in minutes", () => {
    const date = new Date(2026, 1, 26);
    const result = calculateWorkshopEndTime(date, "14:00", 90);
    expect(result).not.toBeNull();
    expect(result!.getHours()).toBe(15);
    expect(result!.getMinutes()).toBe(30);
  });

  it("returns null when date is null", () => {
    expect(calculateWorkshopEndTime(null, "14:00", 60)).toBeNull();
  });

  it("returns null when time is null", () => {
    expect(calculateWorkshopEndTime(new Date(), null, 60)).toBeNull();
  });

  it("returns null when duration is null", () => {
    expect(calculateWorkshopEndTime(new Date(), "14:00", null)).toBeNull();
  });

  it("returns null when duration is 0", () => {
    expect(calculateWorkshopEndTime(new Date(), "14:00", 0)).toBeNull();
  });
});

describe("isWorkshopValidForConflictCheck", () => {
  const validWorkshop = {
    id: "ws-1",
    status: "PUBLISHED",
    date: new Date(),
    time: "14:00",
    duration: 60,
  };

  it("returns true for a valid workshop", () => {
    expect(isWorkshopValidForConflictCheck(validWorkshop)).toBe(true);
  });

  it("returns false when workshop id matches excludeWorkshopId", () => {
    expect(isWorkshopValidForConflictCheck(validWorkshop, "ws-1")).toBe(false);
  });

  it("returns false when status is CANCELLED", () => {
    expect(
      isWorkshopValidForConflictCheck({ ...validWorkshop, status: "CANCELLED" })
    ).toBe(false);
  });

  it("returns false when date is null", () => {
    expect(
      isWorkshopValidForConflictCheck({ ...validWorkshop, date: null })
    ).toBe(false);
  });

  it("returns false when time is null", () => {
    expect(
      isWorkshopValidForConflictCheck({ ...validWorkshop, time: null })
    ).toBe(false);
  });

  it("returns false when duration is null", () => {
    expect(
      isWorkshopValidForConflictCheck({ ...validWorkshop, duration: null })
    ).toBe(false);
  });

  it("returns true when excludeWorkshopId does not match", () => {
    expect(isWorkshopValidForConflictCheck(validWorkshop, "ws-other")).toBe(
      true
    );
  });
});

describe("calculateWorkshopTimeRange", () => {
  it("returns start and end times for a valid workshop", () => {
    const workshop = {
      date: new Date(2026, 1, 26),
      time: "10:00",
      duration: 120,
    };
    const { startTime, endTime } = calculateWorkshopTimeRange(workshop);
    expect(startTime).not.toBeNull();
    expect(endTime).not.toBeNull();
    expect(startTime!.getHours()).toBe(10);
    expect(endTime!.getHours()).toBe(12);
  });

  it("returns null for both when data is missing", () => {
    const { startTime, endTime } = calculateWorkshopTimeRange({
      date: null,
      time: null,
      duration: null,
    });
    expect(startTime).toBeNull();
    expect(endTime).toBeNull();
  });
});

describe("buildWorkshopUpdateData", () => {
  it("includes only provided fields", () => {
    const result = buildWorkshopUpdateData({ date: new Date(2026, 1, 26) });
    expect(result.date).toBeDefined();
    expect(result.time).toBeUndefined();
    expect(result.duration).toBeUndefined();
  });

  it("falls back to existingWorkshop for null duration", () => {
    const result = buildWorkshopUpdateData({
      duration: null,
      existingWorkshop: { duration: 90 },
    });
    expect(result.duration).toBe(90);
  });

  it("falls back to existingWorkshop for null maxParticipants", () => {
    const result = buildWorkshopUpdateData({
      maxParticipants: null,
      existingWorkshop: { maxParticipants: 10 },
    });
    expect(result.maxParticipants).toBe(10);
  });

  it("uses provided value over existingWorkshop", () => {
    const result = buildWorkshopUpdateData({
      duration: 60,
      existingWorkshop: { duration: 90 },
    });
    expect(result.duration).toBe(60);
  });

  it("sanitizes location", () => {
    const result = buildWorkshopUpdateData({
      location: "  <b>Room</b> A  ",
    });
    expect(result.location).toBe("Room A");
  });

  it("sets location to null when input is null and no existing", () => {
    const result = buildWorkshopUpdateData({ location: null });
    expect(result.location).toBeNull();
  });
});
