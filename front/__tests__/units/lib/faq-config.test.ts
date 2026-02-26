import { describe, it, expect } from "vitest";
import { faqConfig } from "@/lib/faq-config";

describe("faqConfig", () => {
  describe("categories", () => {
    it("should have at least one category", () => {
      expect(faqConfig.categories.length).toBeGreaterThan(0);
    });

    it("should have unique category IDs", () => {
      const ids = faqConfig.categories.map((c) => c.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("should have unique order values", () => {
      const orders = faqConfig.categories.map((c) => c.order);
      expect(new Set(orders).size).toBe(orders.length);
    });

    it("should have categories sorted by order", () => {
      for (let i = 1; i < faqConfig.categories.length; i++) {
        expect(faqConfig.categories[i].order).toBeGreaterThan(
          faqConfig.categories[i - 1].order
        );
      }
    });

    it("each category should have id, name, and order", () => {
      for (const cat of faqConfig.categories) {
        expect(cat.id).toBeTruthy();
        expect(cat.name).toBeTruthy();
        expect(cat.order).toBeGreaterThan(0);
      }
    });
  });

  describe("questions", () => {
    it("should have at least one question", () => {
      expect(faqConfig.questions.length).toBeGreaterThan(0);
    });

    it("should have unique question IDs", () => {
      const ids = faqConfig.questions.map((q) => q.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("every question should reference an existing categoryId", () => {
      const categoryIds = new Set(faqConfig.categories.map((c) => c.id));
      for (const question of faqConfig.questions) {
        expect(categoryIds.has(question.categoryId)).toBe(true);
      }
    });

    it("each question should have non-empty question and answer", () => {
      for (const q of faqConfig.questions) {
        expect(q.question.length).toBeGreaterThan(0);
        expect(q.answer.length).toBeGreaterThan(0);
      }
    });

    it("should have questions for multiple categories", () => {
      const usedCategories = new Set(
        faqConfig.questions.map((q) => q.categoryId)
      );
      expect(usedCategories.size).toBeGreaterThan(1);
    });
  });
});
