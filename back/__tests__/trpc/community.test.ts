import { describe, it, expect, vi, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";
import { createCaller, createProtectedContext } from "./helpers/caller";

// Mock Prisma
vi.mock("@/lib/common/prisma", () => ({
  prisma: {
    workshop: {
      findMany: vi.fn(),
      aggregate: vi.fn(),
      count: vi.fn(),
    },
    community_event: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    student_deal: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    community_spot: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    community_poll: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    poll_vote: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    user: {
      count: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    audit_log: {
      create: vi.fn().mockResolvedValue({ id: "log-1" }),
    },
  },
}));

import { prisma } from "@/lib/common/prisma";

describe("Community Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getHubData", () => {
    it("returns hub data correctly", async () => {
      const ctx = createProtectedContext({ userId: "user-1" });
      const caller = createCaller(ctx);

      (prisma.workshop.findMany as any).mockResolvedValue([]);
      (prisma.community_event.findMany as any).mockResolvedValue([]);
      (prisma.student_deal.findMany as any).mockResolvedValue([]);
      (prisma.community_spot.findMany as any).mockResolvedValue([]);
      (prisma.community_poll.findFirst as any).mockResolvedValue({
        id: "cpol15720000010mscuid1234",
        question: "How are you?",
        options: [{ id: "copt15720000010mscuid1234", label: "Good" }],
        votes: [],
        status: "APPROVED",
        active: true,
      });
      (prisma.poll_vote.findFirst as any).mockResolvedValue(null);
      (prisma.user.count as any).mockResolvedValue(100);
      (prisma.workshop.aggregate as any).mockResolvedValue({
        _sum: { duration: 120 },
      });
      (prisma.workshop.count as any).mockResolvedValue(10);
      (prisma.user.findMany as any).mockResolvedValue([]);

      const result = await caller.community.getHubData();

      expect(result.stats.totalMembers).toBe(100);
      expect(result.activePoll?.question).toBe("How are you?");
      expect(result.activePoll?.hasVoted).toBe(false);
    });
  });

  describe("voteInPoll", () => {
    it("registers a vote if not already voted", async () => {
      const ctx = createProtectedContext({ userId: "user-1" });
      const caller = createCaller(ctx);

      (prisma.community_poll.findUnique as any).mockResolvedValue({
        id: "cpol15720000010mscuid1234",
        active: true,
        status: "APPROVED",
      });
      (prisma.poll_vote.findUnique as any).mockResolvedValue(null);
      (prisma.poll_vote.create as any).mockResolvedValue({ id: "vote-1" });

      const result = await caller.community.voteInPoll({
        pollId: "cpol15720000010mscuid1234",
        optionId: "copt15720000010mscuid1234",
      });

      expect(result).toBeDefined();
      expect(prisma.poll_vote.create).toHaveBeenCalledWith({
        data: {
          pollId: "cpol15720000010mscuid1234",
          userId: "user-1",
          optionId: "copt15720000010mscuid1234",
        },
      });
    });

    it("throws BAD_REQUEST if already voted", async () => {
      const ctx = createProtectedContext({ userId: "user-1" });
      const caller = createCaller(ctx);

      (prisma.community_poll.findUnique as any).mockResolvedValue({
        id: "cpol15720000010mscuid1234",
        active: true,
        status: "APPROVED",
      });
      (prisma.poll_vote.findUnique as any).mockResolvedValue({
        id: "existing-vote",
      });

      await expect(
        caller.community.voteInPoll({
          pollId: "cpol15720000010mscuid1234",
          optionId: "copt15720000010mscuid1234",
        }),
      ).rejects.toThrow(
        new TRPCError({ code: "BAD_REQUEST", message: "Déjà voté." }),
      );
    });
  });

  describe("proposals", () => {
    it("proposeEvent creates a pending event", async () => {
      const ctx = createProtectedContext({ userId: "user-1" });
      const caller = createCaller(ctx);

      const input = {
        title: "Study Session",
        description: "Let's study together",
        date: new Date(),
        location: "Library",
      };

      await caller.community.proposeEvent(input);

      expect(prisma.community_event.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: "Study Session",
          proposedById: "user-1",
          status: "PENDING",
        }),
      });
    });
  });

  describe("admin functions", () => {
    it("reviewProposal updates status", async () => {
      // Mock admin check if necessary, assuming adminProcedure handles it
      // In these tests, we mock the ctx as if it passed the admin check
      const ctx = createProtectedContext({ userId: "admin-1" });
      // We need to ensure prisma.user.findUnique returns an admin for adminProcedure
      (prisma.user.findUnique as any).mockResolvedValue({
        id: "admin-1",
        role: "ADMIN",
        status: "ACTIVE",
      });

      const caller = createCaller(ctx);

      await caller.community.reviewProposal({
        type: "EVENT",
        id: "ev-1",
        action: "APPROVE",
      });

      expect(prisma.community_event.update).toHaveBeenCalledWith({
        where: { id: "ev-1" },
        data: { status: "APPROVED" },
      });
    });

    it("bulkReviewProposals updates multiple statuses", async () => {
      const ctx = createProtectedContext({ userId: "admin-1" });
      (prisma.user.findUnique as any).mockResolvedValue({
        id: "admin-1",
        role: "ADMIN",
        status: "ACTIVE",
      });
      (prisma.community_event.updateMany as any).mockResolvedValue({ count: 2 });

      const caller = createCaller(ctx);

      await caller.community.bulkReviewProposals({
        type: "EVENT",
        ids: ["ev-1", "ev-2"],
        action: "APPROVE",
      });

      expect(prisma.community_event.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ["ev-1", "ev-2"] } },
        data: { status: "APPROVED" },
      });
    });
  });
});
