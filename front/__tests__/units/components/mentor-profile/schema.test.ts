import { describe, it, expect } from "vitest";
import { mentorProfileSchema } from "@/components/mentor-profile/schema";

describe("mentorProfileSchema", () => {
  const validData = {
    name: "Jean Dupont",
    bio: "Un mentor passionné par le développement et l'enseignement.",
    areasOfExpertise: ["Programmation"],
  };

  describe("name", () => {
    it("should reject name shorter than 2 chars", () => {
      const result = mentorProfileSchema.safeParse({
        ...validData,
        name: "A",
      });
      expect(result.success).toBe(false);
    });

    it("should reject name exceeding 40 chars", () => {
      const result = mentorProfileSchema.safeParse({
        ...validData,
        name: "A".repeat(41),
      });
      expect(result.success).toBe(false);
    });

    it("should accept name at 2 chars", () => {
      const result = mentorProfileSchema.safeParse({
        ...validData,
        name: "AB",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("bio", () => {
    it("should reject bio shorter than 20 chars", () => {
      const result = mentorProfileSchema.safeParse({
        ...validData,
        bio: "Court",
      });
      expect(result.success).toBe(false);
    });

    it("should reject bio exceeding 250 chars", () => {
      const result = mentorProfileSchema.safeParse({
        ...validData,
        bio: "A".repeat(251),
      });
      expect(result.success).toBe(false);
    });

    it("should accept bio at 20 chars", () => {
      const result = mentorProfileSchema.safeParse({
        ...validData,
        bio: "A".repeat(20),
      });
      expect(result.success).toBe(true);
    });
  });

  describe("domain", () => {
    it("should accept undefined domain", () => {
      const result = mentorProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject domain shorter than 2 chars", () => {
      const result = mentorProfileSchema.safeParse({
        ...validData,
        domain: "A",
      });
      expect(result.success).toBe(false);
    });

    it("should reject domain exceeding 60 chars", () => {
      const result = mentorProfileSchema.safeParse({
        ...validData,
        domain: "A".repeat(61),
      });
      expect(result.success).toBe(false);
    });
  });

  describe("areasOfExpertise", () => {
    it("should reject empty array", () => {
      const result = mentorProfileSchema.safeParse({
        ...validData,
        areasOfExpertise: [],
      });
      expect(result.success).toBe(false);
    });

    it("should accept single area", () => {
      const result = mentorProfileSchema.safeParse({
        ...validData,
        areasOfExpertise: ["React"],
      });
      expect(result.success).toBe(true);
    });

    it("should reject more than 10 areas", () => {
      const result = mentorProfileSchema.safeParse({
        ...validData,
        areasOfExpertise: Array.from({ length: 11 }, (_, i) => `Area ${i}`),
      });
      expect(result.success).toBe(false);
    });

    it("should accept exactly 10 areas", () => {
      const result = mentorProfileSchema.safeParse({
        ...validData,
        areasOfExpertise: Array.from({ length: 10 }, (_, i) => `Area ${i}`),
      });
      expect(result.success).toBe(true);
    });

    it("should reject area exceeding 50 chars", () => {
      const result = mentorProfileSchema.safeParse({
        ...validData,
        areasOfExpertise: ["A".repeat(51)],
      });
      expect(result.success).toBe(false);
    });
  });

  describe("qualifications", () => {
    it("should accept undefined", () => {
      const result = mentorProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept null", () => {
      const result = mentorProfileSchema.safeParse({
        ...validData,
        qualifications: null,
      });
      expect(result.success).toBe(true);
    });

    it("should reject more than 20 qualifications", () => {
      const result = mentorProfileSchema.safeParse({
        ...validData,
        qualifications: Array.from({ length: 21 }, (_, i) => `Qual ${i}`),
      });
      expect(result.success).toBe(false);
    });

    it("should accept 20 qualifications", () => {
      const result = mentorProfileSchema.safeParse({
        ...validData,
        qualifications: Array.from({ length: 20 }, (_, i) => `Qual ${i}`),
      });
      expect(result.success).toBe(true);
    });
  });

  describe("experience", () => {
    it("should accept null", () => {
      const result = mentorProfileSchema.safeParse({
        ...validData,
        experience: null,
      });
      expect(result.success).toBe(true);
    });

    it("should reject more than 20 experiences", () => {
      const result = mentorProfileSchema.safeParse({
        ...validData,
        experience: Array.from({ length: 21 }, (_, i) => `Exp ${i}`),
      });
      expect(result.success).toBe(false);
    });
  });

  describe("socialMediaLinks", () => {
    it("should accept undefined", () => {
      const result = mentorProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept null", () => {
      const result = mentorProfileSchema.safeParse({
        ...validData,
        socialMediaLinks: null,
      });
      expect(result.success).toBe(true);
    });

    it("should accept valid URLs", () => {
      const result = mentorProfileSchema.safeParse({
        ...validData,
        socialMediaLinks: {
          linkedin: "https://linkedin.com/in/jean",
          twitter: "https://twitter.com/jean",
          youtube: "",
          github: "",
        },
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid URLs", () => {
      const result = mentorProfileSchema.safeParse({
        ...validData,
        socialMediaLinks: {
          linkedin: "not-a-url",
        },
      });
      expect(result.success).toBe(false);
    });

    it("should accept empty strings", () => {
      const result = mentorProfileSchema.safeParse({
        ...validData,
        socialMediaLinks: {
          linkedin: "",
          twitter: "",
          youtube: "",
          github: "",
        },
      });
      expect(result.success).toBe(true);
    });
  });

  describe("mentorshipTopics", () => {
    it("should accept null", () => {
      const result = mentorProfileSchema.safeParse({
        ...validData,
        mentorshipTopics: null,
      });
      expect(result.success).toBe(true);
    });

    it("should reject more than 15 topics", () => {
      const result = mentorProfileSchema.safeParse({
        ...validData,
        mentorshipTopics: Array.from({ length: 16 }, (_, i) => `Topic ${i}`),
      });
      expect(result.success).toBe(false);
    });

    it("should accept 15 topics", () => {
      const result = mentorProfileSchema.safeParse({
        ...validData,
        mentorshipTopics: Array.from({ length: 15 }, (_, i) => `Topic ${i}`),
      });
      expect(result.success).toBe(true);
    });

    it("should reject topic exceeding 50 chars", () => {
      const result = mentorProfileSchema.safeParse({
        ...validData,
        mentorshipTopics: ["A".repeat(51)],
      });
      expect(result.success).toBe(false);
    });
  });

  describe("photo", () => {
    it("should accept undefined", () => {
      const result = mentorProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept null", () => {
      const result = mentorProfileSchema.safeParse({
        ...validData,
        photo: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("full valid data", () => {
    it("should accept complete valid data", () => {
      const result = mentorProfileSchema.safeParse({
        ...validData,
        domain: "Développement Web",
        qualifications: ["Master Informatique"],
        experience: ["5 ans de dev"],
        socialMediaLinks: {
          linkedin: "https://linkedin.com/in/jean",
          twitter: "",
          youtube: "",
          github: "https://github.com/jean",
        },
        mentorshipTopics: ["React", "TypeScript"],
      });
      expect(result.success).toBe(true);
    });
  });
});
