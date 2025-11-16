import { profProcedure, publicProcedure, router } from "../lib/trpc";
import { container } from "../lib/di/container";
import {
  createWorkshopSchema,
  updateWorkshopSchema,
  publishWorkshopSchema,
  unpublishWorkshopSchema,
  deleteWorkshopSchema,
} from "../lib/workshops/services";
import { z } from "zod";

export const workshopRouter = router({
  create: profProcedure.input(createWorkshopSchema).mutation(async ({ ctx, input }) => {
    const result = await container.workshopService.createWorkshop(ctx.session.user.id, input);
    if (!result.ok) {
      throw new Error(result.error);
    }
    return result.data;
  }),

  update: profProcedure.input(updateWorkshopSchema).mutation(async ({ ctx, input }) => {
    const result = await container.workshopService.updateWorkshop(ctx.session.user.id, input);
    if (!result.ok) {
      throw new Error(result.error);
    }
    return result.data;
  }),

  publish: profProcedure.input(publishWorkshopSchema).mutation(async ({ ctx, input }) => {
    const result = await container.workshopService.publishWorkshop(ctx.session.user.id, input);
    if (!result.ok) {
      throw new Error(result.error);
    }
    return result.data;
  }),

  unpublish: profProcedure.input(unpublishWorkshopSchema).mutation(async ({ ctx, input }) => {
    const result = await container.workshopService.unpublishWorkshop(ctx.session.user.id, input);
    if (!result.ok) {
      throw new Error(result.error);
    }
    return result.data;
  }),

  delete: profProcedure.input(deleteWorkshopSchema).mutation(async ({ ctx, input }) => {
    const result = await container.workshopService.deleteWorkshop(ctx.session.user.id, input);
    if (!result.ok) {
      throw new Error(result.error);
    }
    return result.data;
  }),

  getMyWorkshops: profProcedure.query(async ({ ctx }) => {
    const result = await container.workshopService.getWorkshopsByCreator(ctx.session.user.id);
    if (!result.ok) {
      throw new Error(result.error);
    }
    return result.data;
  }),

  getPublished: publicProcedure.query(async () => {
    const result = await container.workshopService.getPublishedWorkshops();
    if (!result.ok) {
      throw new Error(result.error);
    }
    return result.data;
  }),

  getById: publicProcedure.input(z.object({ workshopId: z.string() })).query(async ({ input }) => {
    const result = await container.workshopService.getWorkshopById(input.workshopId);
    if (!result.ok) {
      throw new Error(result.error);
    }
    return result.data;
  }),
});

