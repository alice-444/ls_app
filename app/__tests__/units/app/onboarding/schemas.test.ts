import { describe, it, expect } from "vitest";
import { profFormSchema } from "@/app/onboarding/schemas";

describe("profFormSchema", () => {
  const validData = {
    name: "Jean Dupont",
    bio: "Je suis passionné par le développement web et le mentorat.",
    domain: "Programmation",
  };

  describe("name", () => {
    it("should reject name shorter than 2 chars", () => {
      const result = profFormSchema.safeParse({ ...validData, name: "A" });
      expect(result.success).toBe(false);
    });

    it("should reject empty name", () => {
      const result = profFormSchema.safeParse({ ...validData, name: "" });
      expect(result.success).toBe(false);
    });

    it("should accept name with 2 chars", () => {
      const result = profFormSchema.safeParse({ ...validData, name: "AB" });
      expect(result.success).toBe(true);
    });

    it("should reject name exceeding 40 chars", () => {
      const result = profFormSchema.safeParse({
        ...validData,
        name: "A".repeat(41),
      });
      expect(result.success).toBe(false);
    });

    it("should accept name at exactly 40 chars", () => {
      const result = profFormSchema.safeParse({
        ...validData,
        name: "A".repeat(40),
      });
      expect(result.success).toBe(true);
    });

    it("should trim whitespace before validation", () => {
      const result = profFormSchema.safeParse({ ...validData, name: "  A  " });
      expect(result.success).toBe(false);
    });
  });

  describe("bio", () => {
    it("should reject bio shorter than 10 chars", () => {
      const result = profFormSchema.safeParse({
        ...validData,
        bio: "Trop cour",
      });
      expect(result.success).toBe(false);
    });

    it("should accept bio with exactly 10 chars", () => {
      const result = profFormSchema.safeParse({
        ...validData,
        bio: "A".repeat(10),
      });
      expect(result.success).toBe(true);
    });

    it("should reject bio exceeding 250 chars", () => {
      const result = profFormSchema.safeParse({
        ...validData,
        bio: "A".repeat(251),
      });
      expect(result.success).toBe(false);
    });

    it("should accept bio at exactly 250 chars", () => {
      const result = profFormSchema.safeParse({
        ...validData,
        bio: "A".repeat(250),
      });
      expect(result.success).toBe(true);
    });
  });

  describe("domain", () => {
    it("should reject domain shorter than 2 chars", () => {
      const result = profFormSchema.safeParse({ ...validData, domain: "A" });
      expect(result.success).toBe(false);
    });

    it("should accept domain with 2 chars", () => {
      const result = profFormSchema.safeParse({ ...validData, domain: "IA" });
      expect(result.success).toBe(true);
    });

    it("should reject domain exceeding 60 chars", () => {
      const result = profFormSchema.safeParse({
        ...validData,
        domain: "A".repeat(61),
      });
      expect(result.success).toBe(false);
    });
  });

  describe("photo", () => {
    it("should accept undefined photo", () => {
      const result = profFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept null photo", () => {
      const result = profFormSchema.safeParse({
        ...validData,
        photo: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("full valid data", () => {
    it("should accept complete valid data", () => {
      const result = profFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});
