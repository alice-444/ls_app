import { describe, it, expect } from "vitest";
import { WORKSHOP_VALIDATION, WORKSHOP_ERROR_MESSAGES } from "@ls-app/shared";

describe("WORKSHOP_VALIDATION", () => {
  it("should have title with min and max", () => {
    expect(WORKSHOP_VALIDATION.title.min).toBeGreaterThan(0);
    expect(WORKSHOP_VALIDATION.title.max).toBeGreaterThan(
      WORKSHOP_VALIDATION.title.min,
    );
  });

  it("should have description with max", () => {
    expect(WORKSHOP_VALIDATION.description.max).toBeGreaterThan(0);
  });

  it("should have time regex", () => {
    expect(WORKSHOP_VALIDATION.time.regex).toBeInstanceOf(RegExp);
    expect(WORKSHOP_VALIDATION.time.regex.test("14:30")).toBe(true);
    expect(WORKSHOP_VALIDATION.time.regex.test("25:00")).toBe(false);
  });

  it("should have duration with min < max", () => {
    expect(WORKSHOP_VALIDATION.duration.min).toBeGreaterThan(0);
    expect(WORKSHOP_VALIDATION.duration.max).toBeGreaterThan(
      WORKSHOP_VALIDATION.duration.min,
    );
  });

  it("should have durationHours with min 0 and max 8", () => {
    expect(WORKSHOP_VALIDATION.durationHours.min).toBe(0);
    expect(WORKSHOP_VALIDATION.durationHours.max).toBe(8);
  });

  it("should have durationMinutes with min 0 and max 59", () => {
    expect(WORKSHOP_VALIDATION.durationMinutes.min).toBe(0);
    expect(WORKSHOP_VALIDATION.durationMinutes.max).toBe(59);
  });

  it("should have location with max", () => {
    expect(WORKSHOP_VALIDATION.location.max).toBeGreaterThan(0);
  });

  it("should have maxParticipants with min 1", () => {
    expect(WORKSHOP_VALIDATION.maxParticipants.min).toBe(1);
    expect(WORKSHOP_VALIDATION.maxParticipants.max).toBeGreaterThan(1);
  });

  it("should have topic with min < max", () => {
    expect(WORKSHOP_VALIDATION.topic.min).toBeGreaterThan(0);
    expect(WORKSHOP_VALIDATION.topic.max).toBeGreaterThan(
      WORKSHOP_VALIDATION.topic.min,
    );
  });
});

describe("WORKSHOP_ERROR_MESSAGES", () => {
  it("should have error messages for each field", () => {
    expect(WORKSHOP_ERROR_MESSAGES.title.min).toBeTruthy();
    expect(WORKSHOP_ERROR_MESSAGES.title.max).toBeTruthy();
    expect(WORKSHOP_ERROR_MESSAGES.description.max).toBeTruthy();
    expect(WORKSHOP_ERROR_MESSAGES.date.required).toBeTruthy();
    expect(WORKSHOP_ERROR_MESSAGES.date.minimumTomorrow).toBeTruthy();
    expect(WORKSHOP_ERROR_MESSAGES.time.required).toBeTruthy();
    expect(WORKSHOP_ERROR_MESSAGES.time.invalidFormat).toBeTruthy();
    expect(WORKSHOP_ERROR_MESSAGES.duration.min).toBeTruthy();
    expect(WORKSHOP_ERROR_MESSAGES.duration.max).toBeTruthy();
    expect(WORKSHOP_ERROR_MESSAGES.location.max).toBeTruthy();
    expect(WORKSHOP_ERROR_MESSAGES.maxParticipants.range).toBeTruthy();
    expect(WORKSHOP_ERROR_MESSAGES.topic.min).toBeTruthy();
    expect(WORKSHOP_ERROR_MESSAGES.topic.max).toBeTruthy();
  });

  it("should reference validation values in messages", () => {
    expect(WORKSHOP_ERROR_MESSAGES.title.min).toContain(
      String(WORKSHOP_VALIDATION.title.min),
    );
    expect(WORKSHOP_ERROR_MESSAGES.title.max).toContain(
      String(WORKSHOP_VALIDATION.title.max),
    );
  });
});
