import { protectedProcedure, router } from "../../lib/trpc-server";
import {
  receiverUserIdSchema,
  connectionIdSchema,
  otherUserIdSchema,
} from "@ls-app/shared";
import { container } from "../../lib/di/container";
import { handleRouterResult } from "../shared/router-helpers";

export const connectionRouter = router({
  sendConnectionRequest: protectedProcedure
    .input(receiverUserIdSchema)
    .mutation(async ({ ctx, input }) => {
      const result =
        await container.userConnectionService.sendConnectionRequest(
          ctx.session.user.id,
          input.receiverUserId,
        );
      return handleRouterResult(result, {
        operation: "sendConnectionRequest",
        userId: ctx.session.user.id,
        receiverUserId: input.receiverUserId,
      });
    }),

  acceptConnectionRequest: protectedProcedure
    .input(connectionIdSchema)
    .mutation(async ({ ctx, input }) => {
      const result =
        await container.userConnectionService.acceptConnectionRequest(
          ctx.session.user.id,
          input.connectionId,
        );
      return handleRouterResult(result, {
        operation: "acceptConnectionRequest",
        userId: ctx.session.user.id,
        connectionId: input.connectionId,
      });
    }),

  rejectConnectionRequest: protectedProcedure
    .input(connectionIdSchema)
    .mutation(async ({ ctx, input }) => {
      const result =
        await container.userConnectionService.rejectConnectionRequest(
          ctx.session.user.id,
          input.connectionId,
        );
      return handleRouterResult(result, {
        operation: "rejectConnectionRequest",
        userId: ctx.session.user.id,
        connectionId: input.connectionId,
      });
    }),

  removeConnection: protectedProcedure
    .input(otherUserIdSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await container.userConnectionService.removeConnection(
        ctx.session.user.id,
        input.otherUserId,
      );
      return handleRouterResult(result, {
        operation: "removeConnection",
        userId: ctx.session.user.id,
        otherUserId: input.otherUserId,
      });
    }),

  checkConnectionStatus: protectedProcedure
    .input(otherUserIdSchema)
    .query(async ({ ctx, input }) => {
      const result =
        await container.userConnectionService.checkConnectionStatus(
          ctx.session.user.id,
          input.otherUserId,
        );
      return handleRouterResult(result, {
        operation: "checkConnectionStatus",
        userId: ctx.session.user.id,
        otherUserId: input.otherUserId,
      });
    }),

  getPendingRequestsReceived: protectedProcedure.query(async ({ ctx }) => {
    const result =
      await container.userConnectionService.getPendingRequestsReceived(
        ctx.session.user.id,
      );
    return handleRouterResult(result, {
      operation: "getPendingRequestsReceived",
      userId: ctx.session.user.id,
    });
  }),

  getAcceptedConnections: protectedProcedure.query(async ({ ctx }) => {
    const result = await container.userConnectionService.getAcceptedConnections(
      ctx.session.user.id,
    );
    return handleRouterResult(result, {
      operation: "getAcceptedConnections",
      userId: ctx.session.user.id,
    });
  }),

  getPendingRequestsSent: protectedProcedure.query(async ({ ctx }) => {
    const result = await container.userConnectionService.getPendingRequestsSent(
      ctx.session.user.id,
    );
    return handleRouterResult(result, {
      operation: "getPendingRequestsSent",
      userId: ctx.session.user.id,
    });
  }),
});
