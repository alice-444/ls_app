import { describe, it, expect, vi, beforeEach } from "vitest";
import { createCaller, createPublicContext } from "./helpers/caller";

const mockGetPublishedMentorById = vi.fn();

vi.mock("@/lib/di/container", () => ({
  container: {
    mentorProfileService: {
      getPublishedMentorById: (mentorId: string) =>
        mockGetPublishedMentorById(mentorId),
    },
  },
}));

describe("trpc mentor.getById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns mentor when found", async () => {
    const mentor = {
      id: "mentor-1",
      userId: "user-1",
      name: "Jane Mentor",
      bio: "Expert",
    } as any;
    mockGetPublishedMentorById.mockResolvedValue({ ok: true, data: mentor });
    const ctx = createPublicContext();
    const caller = createCaller(ctx);
    const result = await caller.mentor.getById({ mentorId: "mentor-1" });
    expect(result).toEqual(mentor);
    expect(mockGetPublishedMentorById).toHaveBeenCalledWith("mentor-1");
  });

  it("throws when service returns error", async () => {
    mockGetPublishedMentorById.mockResolvedValue({
      ok: false,
      error: "Mentor not found",
    });
    const ctx = createPublicContext();
    const caller = createCaller(ctx);
    await expect(
      caller.mentor.getById({ mentorId: "missing" })
    ).rejects.toThrow();
  });
});
