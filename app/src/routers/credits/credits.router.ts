import { z } from "zod";
import { router, protectedProcedure } from "../../lib/trpc-server";
import { container } from "../../lib/di/container";
import { handleRouterResult } from "../shared/router-helpers";

export const creditsRouter = router({
  getBalance: protectedProcedure.query(async ({ ctx }) => {
    const result = await container.creditService.getBalance(
      ctx.session.user.id
    );
    return handleRouterResult(result, {
      operation: "getBalance",
      userId: ctx.session.user.id,
    });
  }),

  getTransactionHistory: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const result = await container.creditService.getHistory(ctx.session.user.id, {
        limit: input?.limit,
        offset: input?.offset,
      });

      return handleRouterResult(result, {
        operation: "getTransactionHistory",
        userId: ctx.session.user.id,
      });
    }),

  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        credits: z.number().min(1).max(10000),
        amount: z.number().min(0.01).max(10000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await container.polarService.createCheckoutSession(
        ctx.session.user.id,
        input.credits,
        input.amount
      );
      return handleRouterResult(result, {
        operation: "createCheckoutSession",
        userId: ctx.session.user.id,
      });
    }),
});
