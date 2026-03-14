import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../../lib/trpc";
import { prisma } from "../../lib/common/prisma";
import { TRPCError } from "@trpc/server";
import {
  COMMUNITY_HUB_LIMITS,
  pollIdSchema,
  optionIdSchema,
  studentDealSchema,
  communityEventSchema,
  communitySpotSchema,
  communityPollSchema,
  bulkReviewProposalsSchema,
} from "@ls-app/shared";

export const communityRouter = router({
  // --- Public Procedures ---
  getHubData: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const userId = ctx.session.user.id;

    const [
      upcomingWorkshops,
      communityEvents,
      deals,
      spots,
      activePoll,
      userVote,
      stats,
      featuredMembers,
    ] = await Promise.all([
      // Prochains ateliers (Mentorat)
      prisma.workshop.findMany({
        where: { status: "PUBLISHED", date: { gte: now } },
        take: COMMUNITY_HUB_LIMITS.upcomingWorkshops,
        orderBy: { date: "asc" },
        include: {
          creator: {
            select: { id: true, name: true, photoUrl: true, displayName: true },
          },
        },
      }),
      // Events Hub (Community Events - Approved only)
      prisma.community_event.findMany({
        where: { status: "APPROVED", date: { gte: now } },
        take: COMMUNITY_HUB_LIMITS.communityEvents,
        orderBy: { date: "asc" },
      }),
      // Student Deals (Approved only)
      prisma.student_deal.findMany({
        where: { status: "APPROVED" },
        take: COMMUNITY_HUB_LIMITS.deals,
        orderBy: { createdAt: "desc" },
      }),
      // Spot Finder (Approved only)
      prisma.community_spot.findMany({
        where: { status: "APPROVED" },
        take: COMMUNITY_HUB_LIMITS.spots,
        orderBy: { rating: "desc" },
      }),
      // Active Poll (Approved only)
      prisma.community_poll.findFirst({
        where: { active: true, status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        include: { votes: true },
      }),
      // User Vote
      prisma.poll_vote.findFirst({
        where: { userId, poll: { active: true, status: "APPROVED" } },
      }),
      // Impact Stats
      Promise.all([
        prisma.user.count({ where: { status: "ACTIVE" } }),
        prisma.workshop.aggregate({
          where: { status: "COMPLETED" },
          _sum: { duration: true },
        }),
        prisma.workshop.count({ where: { status: "COMPLETED" } }),
      ]).then(([totalMembers, durationSum, completedWorkshops]) => ({
        totalMembers,
        totalHours: Math.round((durationSum._sum.duration || 0) / 60),
        completedWorkshops,
      })),
      // Featured Members
      prisma.user.findMany({
        where: { status: "ACTIVE", role: { in: ["MENTOR", "APPRENANT"] } },
        take: COMMUNITY_HUB_LIMITS.featuredMembers,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          displayName: true,
          photoUrl: true,
          role: true,
          title: true,
        },
      }),
    ]);

    return {
      upcomingWorkshops,
      communityEvents,
      deals,
      spots,
      activePoll: activePoll
        ? {
            ...activePoll,
            options: activePoll.options as any[],
            hasVoted: !!userVote,
            userOptionId: userVote?.optionId,
            totalVotes: activePoll.votes.length,
            results: (activePoll.options as any[]).map((opt) => ({
              optionId: opt.id,
              count: activePoll.votes.filter((v) => v.optionId === opt.id)
                .length,
            })),
          }
        : null,
      stats,
      featuredMembers,
    };
  }),

  voteInPoll: protectedProcedure
    .input(pollIdSchema.merge(optionIdSchema))
    .mutation(async ({ ctx, input }) => {
      const poll = await prisma.community_poll.findUnique({
        where: { id: input.pollId },
      });
      if (!poll || !poll.active || poll.status !== "APPROVED") {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Sondage non trouvé.",
        });
      }
      const existingVote = await prisma.poll_vote.findUnique({
        where: {
          pollId_userId: { pollId: input.pollId, userId: ctx.session.user.id },
        },
      });
      if (existingVote)
        throw new TRPCError({ code: "BAD_REQUEST", message: "Déjà voté." });

      return await prisma.poll_vote.create({
        data: {
          pollId: input.pollId,
          userId: ctx.session.user.id,
          optionId: input.optionId,
        },
      });
    }),

  // --- Proposal Procedures ---
  proposeEvent: protectedProcedure
    .input(communityEventSchema.omit({ imageUrl: true }))
    .mutation(async ({ ctx, input }) => {
      return await prisma.community_event.create({
        data: {
          ...input,
          proposedById: ctx.session.user.id,
          status: "PENDING",
        },
      });
    }),

  proposeDeal: protectedProcedure
    .input(studentDealSchema.omit({ imageUrl: true }))
    .mutation(async ({ ctx, input }) => {
      return await prisma.student_deal.create({
        data: {
          ...input,
          proposedById: ctx.session.user.id,
          status: "PENDING",
        },
      });
    }),

  proposeSpot: protectedProcedure
    .input(communitySpotSchema.omit({ imageUrl: true }))
    .mutation(async ({ ctx, input }) => {
      return await prisma.community_spot.create({
        data: {
          ...input,
          proposedById: ctx.session.user.id,
          status: "PENDING",
        },
      });
    }),

  // --- Admin Procedures ---
  getPendingProposals: adminProcedure.query(async () => {
    const [events, deals, spots, polls] = await Promise.all([
      prisma.community_event.findMany({
        include: { proposedBy: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.student_deal.findMany({
        include: { proposedBy: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.community_spot.findMany({
        include: { proposedBy: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.community_poll.findMany({
        include: { proposedBy: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      }),
    ]);
    return { events, deals, spots, polls };
  }),

  reviewProposal: adminProcedure
    .input(
      z.object({
        type: z.enum(["EVENT", "DEAL", "SPOT", "POLL"]),
        id: z.string(),
        action: z.enum(["APPROVE", "REJECT"]),
      }),
    )
    .mutation(async ({ input }) => {
      const status = input.action === "APPROVE" ? "APPROVED" : "REJECTED";
      switch (input.type) {
        case "EVENT":
          return await prisma.community_event.update({
            where: { id: input.id },
            data: { status },
          });
        case "DEAL":
          return await prisma.student_deal.update({
            where: { id: input.id },
            data: { status },
          });
        case "SPOT":
          return await prisma.community_spot.update({
            where: { id: input.id },
            data: { status },
          });
        case "POLL":
          return await prisma.community_poll.update({
            where: { id: input.id },
            data: { status, active: input.action === "APPROVE" },
          });
      }
    }),

  bulkReviewProposals: adminProcedure
    .input(bulkReviewProposalsSchema)
    .mutation(async ({ input }) => {
      const status = input.action === "APPROVE" ? "APPROVED" : "REJECTED";
      switch (input.type) {
        case "EVENT":
          return await prisma.community_event.updateMany({
            where: { id: { in: input.ids } },
            data: { status },
          });
        case "DEAL":
          return await prisma.student_deal.updateMany({
            where: { id: { in: input.ids } },
            data: { status },
          });
        case "SPOT":
          return await prisma.community_spot.updateMany({
            where: { id: { in: input.ids } },
            data: { status },
          });
        case "POLL":
          return await prisma.community_poll.updateMany({
            where: { id: { in: input.ids } },
            data: { status, active: input.action === "APPROVE" },
          });
      }
    }),

  deleteProposal: adminProcedure
    .input(
      z.object({
        type: z.enum(["EVENT", "DEAL", "SPOT", "POLL"]),
        id: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      switch (input.type) {
        case "EVENT":
          return await prisma.community_event.delete({
            where: { id: input.id },
          });
        case "DEAL":
          return await prisma.student_deal.delete({ where: { id: input.id } });
        case "SPOT":
          return await prisma.community_spot.delete({
            where: { id: input.id },
          });
        case "POLL":
          return await prisma.community_poll.delete({
            where: { id: input.id },
          });
      }
    }),

  createDeal: adminProcedure
    .input(studentDealSchema)
    .mutation(async ({ input }) => {
      return await prisma.student_deal.create({
        data: {
          ...input,
          status: "APPROVED",
        },
      });
    }),

  createEvent: adminProcedure
    .input(communityEventSchema)
    .mutation(async ({ input }) => {
      return await prisma.community_event.create({
        data: {
          ...input,
          status: "APPROVED",
        },
      });
    }),

  createSpot: adminProcedure
    .input(communitySpotSchema)
    .mutation(async ({ input }) => {
      return await prisma.community_spot.create({
        data: {
          ...input,
          status: "APPROVED",
        },
      });
    }),

  createPoll: adminProcedure
    .input(communityPollSchema)
    .mutation(async ({ input }) => {
      return await prisma.community_poll.create({
        data: {
          question: input.question,
          options: input.options.map(o => ({ ...o, id: Math.random().toString(36).substring(7) })),
          status: "APPROVED",
          active: true,
        },
      });
    }),
  });
