import { describe, it, expect, vi, beforeEach } from "vitest";
import { createCaller, createPublicContext } from "./helpers/caller";

const mockGetWorkshopById = vi.fn();

vi.mock("@/lib/di/container", () => ({
  container: {
    workshopService: {
      getWorkshopById: (id: string) => mockGetWorkshopById(id),
    },
  },
}));

describe("trpc workshop.getById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns workshop when found", async () => {
    const workshop = {
      id: "cktvw5720000010mscuid1234",
      title: "Test Workshop",
      status: "PUBLISHED",
      creatorId: "user-1",
    } as any;
    mockGetWorkshopById.mockResolvedValue({ ok: true, data: workshop });
    const ctx = createPublicContext();
    const caller = createCaller(ctx);
    const result = await caller.workshop.getById({
      workshopId: "cktvw5720000010mscuid1234",
    });
    expect(result).toEqual(workshop);
    expect(mockGetWorkshopById).toHaveBeenCalledWith(
      "cktvw5720000010mscuid1234",
    );
  });

  it("throws when service returns error", async () => {
    mockGetWorkshopById.mockResolvedValue({
      ok: false,
      error: "Workshop not found",
    });
    const ctx = createPublicContext();
    const caller = createCaller(ctx);
    await expect(
      caller.workshop.getById({ workshopId: "missing" }),
    ).rejects.toThrow();
  });
});
