import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  workshopFieldSchemas,
  createWorkshopBackendSchema,
  updateWorkshopBackendSchema,
  publishWorkshopSchema,
  unpublishWorkshopSchema,
  deleteWorkshopSchema,
} from "@ls-app/shared";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-02-26T12:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

// ─── Field-level schemas ────────────────────────────────────────────

describe("workshopFieldSchemas.title", () => {
  const schema = workshopFieldSchemas.title;

  it("rejects a title shorter than 5 characters", () => {
    const result = schema.safeParse("Ab");
    expect(result.success).toBe(false);
  });

  it("rejects a title longer than 100 characters", () => {
    const result = schema.safeParse("A".repeat(101));
    expect(result.success).toBe(false);
  });

  it("accepts a valid title", () => {
    const result = schema.safeParse("React Basics");
    expect(result.success).toBe(true);
  });

  it("trims whitespace before validation", () => {
    const result = schema.safeParse("  Hello World  ");
    expect(result.success).toBe(true);
    expect(result.data).toBe("Hello World");
  });

  it("rejects when trimmed length is below minimum", () => {
    const result = schema.safeParse("    Ab   ");
    expect(result.success).toBe(false);
  });
});

describe("workshopFieldSchemas.description", () => {
  const schema = workshopFieldSchemas.description;

  it("rejects a description longer than 100 characters", () => {
    const result = schema.safeParse("A".repeat(101));
    expect(result.success).toBe(false);
  });

  it("accepts an empty string", () => {
    const result = schema.safeParse("");
    expect(result.success).toBe(true);
  });

  it("accepts a valid description", () => {
    const result = schema.safeParse("A short description");
    expect(result.success).toBe(true);
  });
});

describe("workshopFieldSchemas.date", () => {
  const schema = workshopFieldSchemas.date;

  it("rejects a date in the past", () => {
    const result = schema.safeParse("2026-02-20");
    expect(result.success).toBe(false);
  });

  it("rejects today's date", () => {
    const result = schema.safeParse("2026-02-26");
    expect(result.success).toBe(false);
  });

  it("accepts tomorrow's date", () => {
    const result = schema.safeParse("2026-02-27");
    expect(result.success).toBe(true);
  });

  it("accepts a future date", () => {
    const result = schema.safeParse("2026-06-15");
    expect(result.success).toBe(true);
  });

  it("coerces a string to a Date", () => {
    const result = schema.safeParse("2026-03-01");
    expect(result.success).toBe(true);
    expect(result.data).toBeInstanceOf(Date);
  });
});

describe("workshopFieldSchemas.time", () => {
  const schema = workshopFieldSchemas.time;

  it("accepts valid time formats", () => {
    expect(schema.safeParse("09:30").success).toBe(true);
    expect(schema.safeParse("23:59").success).toBe(true);
    expect(schema.safeParse("0:00").success).toBe(true);
  });

  it("rejects invalid time formats", () => {
    expect(schema.safeParse("25:00").success).toBe(false);
    expect(schema.safeParse("12:60").success).toBe(false);
    expect(schema.safeParse("abc").success).toBe(false);
    expect(schema.safeParse("").success).toBe(false);
  });
});

describe("workshopFieldSchemas.duration", () => {
  const schema = workshopFieldSchemas.duration;

  it("rejects duration below 15 minutes", () => {
    expect(schema.safeParse(10).success).toBe(false);
    expect(schema.safeParse(0).success).toBe(false);
  });

  it("rejects duration above 480 minutes", () => {
    expect(schema.safeParse(481).success).toBe(false);
  });

  it("rejects non-integer duration", () => {
    expect(schema.safeParse(30.5).success).toBe(false);
  });

  it("accepts valid durations", () => {
    expect(schema.safeParse(15).success).toBe(true);
    expect(schema.safeParse(60).success).toBe(true);
    expect(schema.safeParse(480).success).toBe(true);
  });
});

describe("workshopFieldSchemas.location", () => {
  const schema = workshopFieldSchemas.location;

  it("rejects location longer than 200 characters", () => {
    expect(schema.safeParse("A".repeat(201)).success).toBe(false);
  });

  it("accepts a valid location", () => {
    expect(schema.safeParse("Salle 101").success).toBe(true);
  });

  it("accepts empty string", () => {
    expect(schema.safeParse("").success).toBe(true);
  });
});

describe("workshopFieldSchemas.maxParticipants", () => {
  const schema = workshopFieldSchemas.maxParticipants;

  it("rejects 0 participants", () => {
    expect(schema.safeParse(0).success).toBe(false);
  });

  it("rejects more than 1000 participants", () => {
    expect(schema.safeParse(1001).success).toBe(false);
  });

  it("rejects non-integer", () => {
    expect(schema.safeParse(5.5).success).toBe(false);
  });

  it("accepts valid values", () => {
    expect(schema.safeParse(1).success).toBe(true);
    expect(schema.safeParse(50).success).toBe(true);
    expect(schema.safeParse(1000).success).toBe(true);
  });
});

describe("workshopFieldSchemas.topic", () => {
  const schema = workshopFieldSchemas.topic;

  it("rejects topic shorter than 2 characters", () => {
    expect(schema.safeParse("A").success).toBe(false);
  });

  it("rejects topic longer than 50 characters", () => {
    expect(schema.safeParse("A".repeat(51)).success).toBe(false);
  });

  it("accepts valid topic", () => {
    expect(schema.safeParse("React").success).toBe(true);
  });
});

describe("workshopFieldSchemas.creditCost", () => {
  const schema = workshopFieldSchemas.creditCost;

  it("rejects credit cost below 20", () => {
    expect(schema.safeParse(19).success).toBe(false);
    expect(schema.safeParse(0).success).toBe(false);
  });

  it("rejects credit cost above 100", () => {
    expect(schema.safeParse(101).success).toBe(false);
  });

  it("rejects non-integer credit cost", () => {
    expect(schema.safeParse(25.5).success).toBe(false);
  });

  it("accepts valid credit costs", () => {
    expect(schema.safeParse(20).success).toBe(true);
    expect(schema.safeParse(50).success).toBe(true);
    expect(schema.safeParse(100).success).toBe(true);
  });
});

// ─── createWorkshopBackendSchema ────────────────────────────────────

describe("createWorkshopBackendSchema", () => {
  it("accepts minimal valid input (title only)", () => {
    const result = createWorkshopBackendSchema.safeParse({
      title: "Mon atelier",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe("");
      expect(result.data.isVirtual).toBe(false);
    }
  });

  it("rejects missing title", () => {
    const result = createWorkshopBackendSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects title too short", () => {
    const result = createWorkshopBackendSchema.safeParse({ title: "Ab" });
    expect(result.success).toBe(false);
  });

  it("accepts full valid input", () => {
    const result = createWorkshopBackendSchema.safeParse({
      title: "React Workshop",
      description: "A great workshop",
      topic: "React",
      date: "2026-03-15",
      time: "14:00",
      duration: 90,
      location: "Salle A",
      isVirtual: false,
      maxParticipants: 20,
      materialsNeeded: "Laptop",
      creditCost: 30,
    });
    expect(result.success).toBe(true);
  });

  it("allows nullable optional fields to be null", () => {
    const result = createWorkshopBackendSchema.safeParse({
      title: "Valid Title",
      topic: null,
      date: null,
      time: null,
      duration: null,
      location: null,
      maxParticipants: null,
      materialsNeeded: null,
      creditCost: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid date (in the past)", () => {
    const result = createWorkshopBackendSchema.safeParse({
      title: "Valid Title",
      date: "2020-01-01",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid duration", () => {
    const result = createWorkshopBackendSchema.safeParse({
      title: "Valid Title",
      duration: 5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid creditCost", () => {
    const result = createWorkshopBackendSchema.safeParse({
      title: "Valid Title",
      creditCost: 10,
    });
    expect(result.success).toBe(false);
  });
});

// ─── updateWorkshopBackendSchema ────────────────────────────────────

describe("updateWorkshopBackendSchema", () => {
  it("requires a valid UUID for workshopId", () => {
    const result = updateWorkshopBackendSchema.safeParse({
      workshopId: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("accepts workshopId only (all other fields optional)", () => {
    const result = updateWorkshopBackendSchema.safeParse({
      workshopId: VALID_UUID,
    });
    expect(result.success).toBe(true);
  });

  it("accepts partial update with valid fields", () => {
    const result = updateWorkshopBackendSchema.safeParse({
      workshopId: VALID_UUID,
      title: "Updated Title",
      duration: 120,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid field values in update", () => {
    const result = updateWorkshopBackendSchema.safeParse({
      workshopId: VALID_UUID,
      duration: 5,
    });
    expect(result.success).toBe(false);
  });

  it("accepts nullable fields as null", () => {
    const result = updateWorkshopBackendSchema.safeParse({
      workshopId: VALID_UUID,
      location: null,
      creditCost: null,
    });
    expect(result.success).toBe(true);
  });
});

// ─── Action schemas (publish / unpublish / delete) ──────────────────

describe("publishWorkshopSchema", () => {
  it("accepts a valid UUID", () => {
    expect(
      publishWorkshopSchema.safeParse({ workshopId: VALID_UUID }).success,
    ).toBe(true);
  });

  it("rejects a non-UUID string", () => {
    expect(publishWorkshopSchema.safeParse({ workshopId: "abc" }).success).toBe(
      false,
    );
  });

  it("rejects missing workshopId", () => {
    expect(publishWorkshopSchema.safeParse({}).success).toBe(false);
  });
});

describe("unpublishWorkshopSchema", () => {
  it("accepts a valid UUID", () => {
    expect(
      unpublishWorkshopSchema.safeParse({ workshopId: VALID_UUID }).success,
    ).toBe(true);
  });

  it("rejects a non-UUID string", () => {
    expect(
      unpublishWorkshopSchema.safeParse({ workshopId: "not-valid" }).success,
    ).toBe(false);
  });
});

describe("deleteWorkshopSchema", () => {
  it("accepts a valid UUID", () => {
    expect(
      deleteWorkshopSchema.safeParse({ workshopId: VALID_UUID }).success,
    ).toBe(true);
  });

  it("rejects a non-UUID string", () => {
    expect(deleteWorkshopSchema.safeParse({ workshopId: "123" }).success).toBe(
      false,
    );
  });

  it("rejects empty string", () => {
    expect(deleteWorkshopSchema.safeParse({ workshopId: "" }).success).toBe(
      false,
    );
  });
});
