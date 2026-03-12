import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createWorkshopFrontendSchema,
  editWorkshopFrontendSchema,
} from "@ls-app/shared";

const validBase = {
  title: "Atelier React Avancé",
  durationHours: 1,
  durationMinutes: 30,
  isVirtual: true,
};

describe("createWorkshopFrontendSchema", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 5, 15));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("title", () => {
    it("should reject title shorter than 5 chars", () => {
      const result = createWorkshopFrontendSchema.safeParse({
        ...validBase,
        title: "Ab",
      });
      expect(result.success).toBe(false);
    });

    it("should accept title at exactly 5 chars", () => {
      const result = createWorkshopFrontendSchema.safeParse({
        ...validBase,
        title: "Abcde",
      });
      expect(result.success).toBe(true);
    });

    it("should reject title exceeding 200 chars", () => {
      const result = createWorkshopFrontendSchema.safeParse({
        ...validBase,
        title: "A".repeat(201),
      });
      expect(result.success).toBe(false);
    });

    it("should accept title at exactly 200 chars", () => {
      const result = createWorkshopFrontendSchema.safeParse({
        ...validBase,
        title: "A".repeat(200),
      });
      expect(result.success).toBe(true);
    });
  });

  describe("description", () => {
    it("should accept undefined description", () => {
      const result = createWorkshopFrontendSchema.safeParse(validBase);
      expect(result.success).toBe(true);
    });

    it("should reject description exceeding 100 chars", () => {
      const result = createWorkshopFrontendSchema.safeParse({
        ...validBase,
        description: "A".repeat(101),
      });
      expect(result.success).toBe(false);
    });
  });

  describe("date", () => {
    it("should reject today's date", () => {
      const result = createWorkshopFrontendSchema.safeParse({
        ...validBase,
        date: "2025-06-15",
      });
      expect(result.success).toBe(false);
    });

    it("should reject past date", () => {
      const result = createWorkshopFrontendSchema.safeParse({
        ...validBase,
        date: "2025-06-10",
      });
      expect(result.success).toBe(false);
    });

    it("should accept tomorrow", () => {
      const result = createWorkshopFrontendSchema.safeParse({
        ...validBase,
        date: "2025-06-16",
      });
      expect(result.success).toBe(true);
    });

    it("should accept future date", () => {
      const result = createWorkshopFrontendSchema.safeParse({
        ...validBase,
        date: "2025-12-01",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("time", () => {
    it("should accept valid time", () => {
      const result = createWorkshopFrontendSchema.safeParse({
        ...validBase,
        time: "14:30",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid time format", () => {
      const result = createWorkshopFrontendSchema.safeParse({
        ...validBase,
        time: "25:00",
      });
      expect(result.success).toBe(false);
    });

    it("should accept undefined time", () => {
      const result = createWorkshopFrontendSchema.safeParse(validBase);
      expect(result.success).toBe(true);
    });
  });

  describe("durationHours", () => {
    it("should reject negative hours", () => {
      const result = createWorkshopFrontendSchema.safeParse({
        ...validBase,
        durationHours: -1,
      });
      expect(result.success).toBe(false);
    });

    it("should accept 0 hours", () => {
      const result = createWorkshopFrontendSchema.safeParse({
        ...validBase,
        durationHours: 0,
      });
      expect(result.success).toBe(true);
    });

    it("should reject more than 8 hours", () => {
      const result = createWorkshopFrontendSchema.safeParse({
        ...validBase,
        durationHours: 9,
      });
      expect(result.success).toBe(false);
    });

    it("should reject non-integer", () => {
      const result = createWorkshopFrontendSchema.safeParse({
        ...validBase,
        durationHours: 1.5,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("durationMinutes", () => {
    it("should reject negative minutes", () => {
      const result = createWorkshopFrontendSchema.safeParse({
        ...validBase,
        durationMinutes: -1,
      });
      expect(result.success).toBe(false);
    });

    it("should accept 0 minutes", () => {
      const result = createWorkshopFrontendSchema.safeParse({
        ...validBase,
        durationMinutes: 0,
      });
      expect(result.success).toBe(true);
    });

    it("should reject more than 59 minutes", () => {
      const result = createWorkshopFrontendSchema.safeParse({
        ...validBase,
        durationMinutes: 60,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("location", () => {
    it("should accept undefined location", () => {
      const result = createWorkshopFrontendSchema.safeParse(validBase);
      expect(result.success).toBe(true);
    });

    it("should reject location exceeding 200 chars", () => {
      const result = createWorkshopFrontendSchema.safeParse({
        ...validBase,
        location: "A".repeat(201),
      });
      expect(result.success).toBe(false);
    });
  });

  describe("maxParticipants", () => {
    it("should accept undefined", () => {
      const result = createWorkshopFrontendSchema.safeParse(validBase);
      expect(result.success).toBe(true);
    });

    it("should reject 0 participants", () => {
      const result = createWorkshopFrontendSchema.safeParse({
        ...validBase,
        maxParticipants: 0,
      });
      expect(result.success).toBe(false);
    });

    it("should accept 1 participant", () => {
      const result = createWorkshopFrontendSchema.safeParse({
        ...validBase,
        maxParticipants: 1,
      });
      expect(result.success).toBe(true);
    });

    it("should reject more than 1000 participants", () => {
      const result = createWorkshopFrontendSchema.safeParse({
        ...validBase,
        maxParticipants: 1001,
      });
      expect(result.success).toBe(false);
    });

    it("should accept 1000 participants", () => {
      const result = createWorkshopFrontendSchema.safeParse({
        ...validBase,
        maxParticipants: 1000,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("topic", () => {
    it("should accept null topic", () => {
      const result = createWorkshopFrontendSchema.safeParse({
        ...validBase,
        topic: null,
      });
      expect(result.success).toBe(true);
    });

    it("should reject topic shorter than 2 chars", () => {
      const result = createWorkshopFrontendSchema.safeParse({
        ...validBase,
        topic: "A",
      });
      expect(result.success).toBe(false);
    });

    it("should reject topic longer than 50 chars", () => {
      const result = createWorkshopFrontendSchema.safeParse({
        ...validBase,
        topic: "A".repeat(51),
      });
      expect(result.success).toBe(false);
    });
  });

  describe("creditCost", () => {
    it("should accept null", () => {
      const result = createWorkshopFrontendSchema.safeParse({
        ...validBase,
        creditCost: null,
      });
      expect(result.success).toBe(true);
    });

    it("should reject less than 20", () => {
      const result = createWorkshopFrontendSchema.safeParse({
        ...validBase,
        creditCost: 19,
      });
      expect(result.success).toBe(false);
    });

    it("should accept 20", () => {
      const result = createWorkshopFrontendSchema.safeParse({
        ...validBase,
        creditCost: 20,
      });
      expect(result.success).toBe(true);
    });

    it("should reject more than 100", () => {
      const result = createWorkshopFrontendSchema.safeParse({
        ...validBase,
        creditCost: 101,
      });
      expect(result.success).toBe(false);
    });

    it("should accept 100", () => {
      const result = createWorkshopFrontendSchema.safeParse({
        ...validBase,
        creditCost: 100,
      });
      expect(result.success).toBe(true);
    });

    it("should reject non-integer", () => {
      const result = createWorkshopFrontendSchema.safeParse({
        ...validBase,
        creditCost: 20.5,
      });
      expect(result.success).toBe(false);
    });
  });
});

describe("editWorkshopFrontendSchema", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 5, 15));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should require workshopId as valid UUID", () => {
    const result = editWorkshopFrontendSchema.safeParse({
      ...validBase,
      workshopId: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("should accept valid data with UUID", () => {
    const result = editWorkshopFrontendSchema.safeParse({
      ...validBase,
      workshopId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("should reject missing workshopId", () => {
    const result = editWorkshopFrontendSchema.safeParse(validBase);
    expect(result.success).toBe(false);
  });
});
