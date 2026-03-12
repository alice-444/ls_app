import { describe, it, expect, vi, beforeEach } from "vitest";
import { createCaller, createPublicContext } from "./helpers/caller";

const mockGetPublicProfile = vi.fn();

vi.mock("@/lib/di/container", () => ({
  container: {
    mentorProfileService: {
      getPublicProfile: (mentorId: string) => mockGetPublicProfile(mentorId),
    },
  },
}));

describe("trpc mentor.getPublicProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns mentor when found", async () => {
    const mentor = {
      id: "cktvw5720000010mscuid1234",
      userId: "user-1",
      name: "Jane Mentor",
      bio: "Expert",
    } as any;
    mockGetPublicProfile.mockResolvedValue({ ok: true, data: mentor });
    const ctx = createPublicContext();
    const caller = createCaller(ctx);
    const result = await caller.mentor.getPublicProfile({
      mentorId: "cktvw5720000010mscuid1234",
    });
    expect(result).toEqual(mentor);
    expect(mockGetPublicProfile).toHaveBeenCalledWith(
      "cktvw5720000010mscuid1234",
    );
  });

  it("throws when service returns error", async () => {
    mockGetPublicProfile.mockResolvedValue({
      ok: false,
      error: "Mentor not found",
    });
    const ctx = createPublicContext();
    const caller = createCaller(ctx);
    await expect(
      caller.mentor.getPublicProfile({ mentorId: "missing" }),
    ).rejects.toThrow();
  });
});
