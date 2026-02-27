import { describe, it, expect, vi } from "vitest";

vi.mock("../../../../../src/lib/common/prisma", () => ({
  prisma: {},
}));

import { calculateAverageRating } from "../../../../../src/lib/mentors/utils/mentor-helpers";

describe("calculateAverageRating", () => {
  it("returns 0 for an empty array", () => {
    expect(calculateAverageRating([])).toBe(0);
  });

  it("returns the value itself for a single rating", () => {
    expect(calculateAverageRating([4])).toBe(4);
  });

  it("calculates the average of multiple ratings", () => {
    expect(calculateAverageRating([3, 4, 5])).toBe(4);
  });

  it("rounds to one decimal place", () => {
    expect(calculateAverageRating([3, 4])).toBe(3.5);
  });

  it("rounds correctly for repeating decimals", () => {
    expect(calculateAverageRating([1, 2, 3])).toBe(2);
  });

  it("handles all identical ratings", () => {
    expect(calculateAverageRating([5, 5, 5, 5])).toBe(5);
  });

  it("rounds 4.666... to 4.7", () => {
    expect(calculateAverageRating([4, 5, 5])).toBe(4.7);
  });
});
