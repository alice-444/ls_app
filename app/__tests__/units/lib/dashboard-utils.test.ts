import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  formatWorkshopDate,
  formatCalendarMonthYear,
  createNavigateCalendar,
} from "@/lib/dashboard-utils";

describe("formatWorkshopDate", () => {
  it("should return empty string for null", () => {
    expect(formatWorkshopDate(null)).toBe("");
  });

  it("should format a Date object in French locale", () => {
    const date = new Date(2025, 5, 15); // June 15, 2025
    const result = formatWorkshopDate(date);
    expect(result).toContain("15");
    expect(result).toContain("2025");
  });

  it("should format a string date", () => {
    const result = formatWorkshopDate("2025-06-15");
    expect(result).toContain("2025");
  });
});

describe("formatCalendarMonthYear", () => {
  it("should format month and year in French locale", () => {
    const date = new Date(2025, 0, 1); // January 2025
    const result = formatCalendarMonthYear(date);
    expect(result).toContain("2025");
    expect(result.toLowerCase()).toContain("janvier");
  });

  it("should handle different months", () => {
    const date = new Date(2025, 11, 1); // December 2025
    const result = formatCalendarMonthYear(date);
    expect(result.toLowerCase()).toContain("décembre");
    expect(result).toContain("2025");
  });
});

describe("createNavigateCalendar", () => {
  let setDate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 5, 15)); // June 15, 2025
    setDate = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should navigate to today", () => {
    const navigate = createNavigateCalendar(
      new Date(2025, 3, 10),
      "month",
      setDate
    );
    navigate("today");
    expect(setDate).toHaveBeenCalledWith(expect.any(Date));
    const calledDate = setDate.mock.calls[0][0] as Date;
    expect(calledDate.getFullYear()).toBe(2025);
    expect(calledDate.getMonth()).toBe(5);
    expect(calledDate.getDate()).toBe(15);
  });

  it("should navigate prev month", () => {
    const currentDate = new Date(2025, 5, 15);
    const navigate = createNavigateCalendar(currentDate, "month", setDate);
    navigate("prev");
    const calledDate = setDate.mock.calls[0][0] as Date;
    expect(calledDate.getMonth()).toBe(4); // May
  });

  it("should navigate next month", () => {
    const currentDate = new Date(2025, 5, 15);
    const navigate = createNavigateCalendar(currentDate, "month", setDate);
    navigate("next");
    const calledDate = setDate.mock.calls[0][0] as Date;
    expect(calledDate.getMonth()).toBe(6); // July
  });

  it("should navigate prev week", () => {
    const currentDate = new Date(2025, 5, 15);
    const navigate = createNavigateCalendar(currentDate, "week", setDate);
    navigate("prev");
    const calledDate = setDate.mock.calls[0][0] as Date;
    expect(calledDate.getDate()).toBe(8);
  });

  it("should navigate next week", () => {
    const currentDate = new Date(2025, 5, 15);
    const navigate = createNavigateCalendar(currentDate, "week", setDate);
    navigate("next");
    const calledDate = setDate.mock.calls[0][0] as Date;
    expect(calledDate.getDate()).toBe(22);
  });

  it("should navigate prev day", () => {
    const currentDate = new Date(2025, 5, 15);
    const navigate = createNavigateCalendar(currentDate, "day", setDate);
    navigate("prev");
    const calledDate = setDate.mock.calls[0][0] as Date;
    expect(calledDate.getDate()).toBe(14);
  });

  it("should navigate next day", () => {
    const currentDate = new Date(2025, 5, 15);
    const navigate = createNavigateCalendar(currentDate, "day", setDate);
    navigate("next");
    const calledDate = setDate.mock.calls[0][0] as Date;
    expect(calledDate.getDate()).toBe(16);
  });

  it("should call setDate with unmodified date for agenda view", () => {
    const currentDate = new Date(2025, 5, 15);
    const navigate = createNavigateCalendar(currentDate, "agenda", setDate);
    navigate("prev");
    expect(setDate).toHaveBeenCalledTimes(1);
    const calledDate = setDate.mock.calls[0][0] as Date;
    expect(calledDate.getDate()).toBe(15);
    expect(calledDate.getMonth()).toBe(5);
  });
});
