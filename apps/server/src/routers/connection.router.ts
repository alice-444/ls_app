import { protectedProcedure, router } from "../lib/trpc";
import { container } from "../lib/di/container";
import { z } from "zod";

export const connectionRouter = router({
  sendConnectionRequest: protectedProcedure
    .input(z.object({ receiverUserId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result =
        await container.userConnectionService.sendConnectionRequest(
          ctx.session.user.id,
          input.receiverUserId
        );
      if (!result.ok) {
        throw new Error(result.error);
      }
      return result.data;
    }),

  acceptConnectionRequest: protectedProcedure
    .input(z.object({ connectionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result =
        await container.userConnectionService.acceptConnectionRequest(
          ctx.session.user.id,
          input.connectionId
        );
      if (!result.ok) {
        throw new Error(result.error);
      }
      return result.data;
    }),

  rejectConnectionRequest: protectedProcedure
    .input(z.object({ connectionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result =
        await container.userConnectionService.rejectConnectionRequest(
          ctx.session.user.id,
          input.connectionId
        );
      if (!result.ok) {
        throw new Error(result.error);
      }
      return result.data;
    }),

  removeConnection: protectedProcedure
    .input(z.object({ otherUserId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = await container.userConnectionService.removeConnection(
        ctx.session.user.id,
        input.otherUserId
      );
      if (!result.ok) {
        throw new Error(result.error);
      }
      return result.data;
    }),

  checkConnectionStatus: protectedProcedure
    .input(z.object({ otherUserId: z.string() }))
    .query(async ({ ctx, input }) => {
      const result =
        await container.userConnectionService.checkConnectionStatus(
          ctx.session.user.id,
          input.otherUserId
        );
      if (!result.ok) {
        throw new Error(result.error);
      }
      return result.data;
    }),

  getPendingRequestsReceived: protectedProcedure.query(async ({ ctx }) => {
    const result =
      await container.userConnectionService.getPendingRequestsReceived(
        ctx.session.user.id
      );
    if (!result.ok) {
      throw new Error(result.error);
    }
    return result.data;
  }),

  getAcceptedConnections: protectedProcedure.query(async ({ ctx }) => {
    const result =
      await container.userConnectionService.getAcceptedConnections(
        ctx.session.user.id
      );
    if (!result.ok) {
      throw new Error(result.error);
    }
    return result.data;
  }),
});

