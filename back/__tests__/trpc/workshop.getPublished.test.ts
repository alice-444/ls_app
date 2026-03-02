import { describe, it, expect, vi, beforeEach } from "vitest";
import { createCaller, createPublicContext } from "./helpers/caller";

const mockGetPublishedWorkshops = vi.fn();

vi.mock("@/lib/di/container", () => ({
  container: {
    workshopService: {
      getPublishedWorkshops: () => mockGetPublishedWorkshops(),
    },
  },
}));

describe("trpc workshop.getPublished", () => {
  beforeEach(() => {
    mockGetPublishedWorkshops.mockResolvedValue({ ok: true, data: [] });
  });

  it("returns workshops list for public caller", async () => {
    const ctx = createPublicContext();
    const caller = createCaller(ctx);
    const result = await caller.workshop.getPublished();
    expect(result).toEqual([]);
    expect(mockGetPublishedWorkshops).toHaveBeenCalled();
  });

  it("returns workshops when service returns data", async () => {
    const workshops = [
      { id: "w1", title: "Workshop 1", status: "PUBLISHED" },
    ] as any;
    mockGetPublishedWorkshops.mockResolvedValue({ ok: true, data: workshops });
    const ctx = createPublicContext();
    const caller = createCaller(ctx);
    const result = await caller.workshop.getPublished();
    expect(result).toEqual(workshops);
  });
});
