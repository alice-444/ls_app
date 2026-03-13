import { mentorProcedure, router } from "../../lib/trpc";
import { container } from "../../lib/di/container";
import { unwrapResult } from "../shared/router-helpers";
import { z } from "zod";
import { workshopIdSchema } from "@ls-app/shared";

export const workshopAttendanceRouter = router({
  getWorkshopParticipants: mentorProcedure
    .input(workshopIdSchema)
    .query(async ({ ctx, input }) =>
      unwrapResult(
        await container.workshopAttendanceService.getWorkshopParticipants(
          ctx.session.user.id,
          input.workshopId,
        ),
      ),
    ),

  updateAttendance: mentorProcedure
    .input(
      z.object({
        workshopId: z.string(),
        participantId: z.string(),
        attendanceStatus: z.enum(["PENDING", "PRESENT", "NO_SHOW"]),
      }),
    )
    .mutation(async ({ ctx, input }) =>
      unwrapResult(
        await container.workshopAttendanceService.updateAttendance(
          ctx.session.user.id,
          input.workshopId,
          input.participantId,
          input.attendanceStatus,
        ),
      ),
    ),

  confirmAttendance: mentorProcedure
    .input(workshopIdSchema)
    .mutation(async ({ ctx, input }) =>
      unwrapResult(
        await container.workshopAttendanceService.confirmAttendance(
          ctx.session.user.id,
          input.workshopId,
        ),
      ),
    ),
});
