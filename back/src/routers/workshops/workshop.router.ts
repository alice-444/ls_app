import {
  profProcedure,
  publicProcedure,
  protectedProcedure,
  router,
} from "../../lib/trpc";
import { container } from "../../lib/di/container";
import {
  createWorkshopSchema,
  updateWorkshopSchema,
  publishWorkshopSchema,
  unpublishWorkshopSchema,
  deleteWorkshopSchema,
} from "../../lib/workshops/services";
import { calculateWorkshopEndTime } from "../../lib/workshops/utils/workshop-helpers";
import { unwrapResult } from "../shared/router-helpers";
import { z } from "zod";

export const workshopRouter = router({
  create: profProcedure
    .input(createWorkshopSchema)
    .mutation(async ({ ctx, input }) =>
      unwrapResult(
        await container.workshopService.createWorkshop(ctx.session.user.id, input)
      )
    ),

  update: profProcedure
    .input(updateWorkshopSchema)
    .mutation(async ({ ctx, input }) =>
      unwrapResult(
        await container.workshopService.updateWorkshop(ctx.session.user.id, input)
      )
    ),

  publish: profProcedure
    .input(publishWorkshopSchema)
    .mutation(async ({ ctx, input }) =>
      unwrapResult(
        await container.workshopService.publishWorkshop(ctx.session.user.id, input)
      )
    ),

  unpublish: profProcedure
    .input(unpublishWorkshopSchema)
    .mutation(async ({ ctx, input }) =>
      unwrapResult(
        await container.workshopService.unpublishWorkshop(ctx.session.user.id, input)
      )
    ),

  delete: profProcedure
    .input(deleteWorkshopSchema)
    .mutation(async ({ ctx, input }) =>
      unwrapResult(
        await container.workshopService.deleteWorkshop(ctx.session.user.id, input)
      )
    ),

  getMyWorkshops: profProcedure.query(async ({ ctx }) =>
    unwrapResult(
      await container.workshopService.getWorkshopsByCreator(ctx.session.user.id)
    )
  ),

  getPublished: publicProcedure.query(async () =>
    unwrapResult(await container.workshopService.getPublishedWorkshops())
  ),

  getById: publicProcedure
    .input(z.object({ workshopId: z.string() }))
    .query(async ({ input }) =>
      unwrapResult(
        await container.workshopService.getWorkshopById(input.workshopId)
      )
    ),

  getConfirmedWorkshops: protectedProcedure.query(async ({ ctx }) =>
    unwrapResult(
      await container.workshopService.getConfirmedWorkshopsForApprentice(
        ctx.session.user.id
      )
    )
  ),

  updateScheduling: protectedProcedure
    .input(
      z.object({
        workshopId: z.string(),
        date: z.coerce.date().optional().nullable(),
        time: z.string().optional().nullable(),
        duration: z.number().int().min(15).max(480).optional().nullable(),
        location: z.string().max(200).optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { workshopId, ...schedulingData } = input;
      return unwrapResult(
        await container.workshopService.updateWorkshopScheduling(
          ctx.session.user.id,
          workshopId,
          schedulingData
        )
      );
    }),

  cancelConfirmed: protectedProcedure
    .input(
      z.object({
        workshopId: z.string(),
        cancellationReason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) =>
      unwrapResult(
        await container.workshopService.cancelConfirmedWorkshop(
          ctx.session.user.id,
          input.workshopId,
          input.cancellationReason
        )
      )
    ),

  getUpcomingWorkshops: protectedProcedure.query(async ({ ctx }) =>
    unwrapResult(
      await container.workshopService.getUpcomingWorkshopsForApprentice(
        ctx.session.user.id
      )
    )
  ),

  getWorkshopHistory: protectedProcedure.query(async ({ ctx }) =>
    unwrapResult(
      await container.workshopService.getWorkshopHistoryForApprentice(
        ctx.session.user.id
      )
    )
  ),

  getAvailableWorkshops: protectedProcedure.query(async ({ ctx }) =>
    unwrapResult(
      await container.workshopService.getAvailableWorkshopsForApprentice(
        ctx.session.user.id
      )
    )
  ),

  reschedule: profProcedure
    .input(
      z.object({
        workshopId: z.string(),
        date: z.coerce.date(),
        time: z
          .string()
          .regex(
            /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
            "Format d'heure invalide (HH:MM requis)"
          ),
        duration: z.number().int().min(15).max(480).optional().nullable(),
        location: z.string().max(200).optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { workshopId, ...rescheduleData } = input;
      return unwrapResult(
        await container.workshopService.rescheduleWorkshop(
          ctx.session.user.id,
          workshopId,
          rescheduleData
        )
      );
    }),

  cancelAfterReschedule: protectedProcedure
    .input(
      z.object({
        workshopId: z.string(),
        cancellationReason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) =>
      unwrapResult(
        await container.workshopService.cancelConfirmedWorkshop(
          ctx.session.user.id,
          input.workshopId,
          input.cancellationReason
        )
      )
    ),

  logVideoLinkClick: protectedProcedure
    .input(z.object({ workshopId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await container.auditLogService.record(
          ctx.session.user.id,
          "VIDEO_LINK_CLICKED",
          {
            workshopId: input.workshopId,
            timestamp: new Date().toISOString(),
          }
        );
        return { success: true };
      } catch (error) {
        console.error("Failed to log video link click:", error);
        return { success: false };
      }
    }),

  getDailyToken: protectedProcedure
    .input(z.object({ workshopId: z.string() }))
    .query(async ({ ctx, input }) => {
      const workshop = unwrapResult(
        await container.workshopService.getWorkshopById(input.workshopId)
      );

      const userId = ctx.session.user.id;
      const isCreator = workshop.creatorId === userId;
      const isApprentice = workshop.apprenticeId === userId;

      if (!isCreator && !isApprentice) {
        throw new Error("You don't have access to this workshop");
      }

      let roomId = workshop.dailyRoomId;
      if (!roomId) {
        const roomResult =
          await container.dailyService.getOrCreateRoomForWorkshop(
            input.workshopId,
            workshop.title
          );
        roomId = unwrapResult(roomResult).roomId;

        await container.workshopRepository.update(input.workshopId, {
          dailyRoomId: roomId,
          dailyRoomLastActivityAt: new Date(),
        });
      } else {
        await container.workshopRepository.update(input.workshopId, {
          dailyRoomLastActivityAt: new Date(),
        });
      }

      const userNameFromDb =
        await container.appUserRepository.findUserNameByUserId(userId);
      const userName = userNameFromDb || ctx.session.user.name || "User";

      return unwrapResult(
        await container.dailyService.generateToken(
          roomId,
          userId,
          userName,
          isCreator
        )
      );
    }),

  getWorkshopParticipants: profProcedure
    .input(z.object({ workshopId: z.string() }))
    .query(async ({ ctx, input }) => {
      const workshop = unwrapResult(
        await container.workshopService.getWorkshopById(input.workshopId)
      );

      if (workshop.creatorId !== ctx.session.user.id) {
        throw new Error("You are not the creator of this workshop");
      }

      const participants: Array<{
        id: string;
        name: string | null;
        email: string | null;
        title: string | null;
        attendanceStatus: "PENDING" | "PRESENT" | "NO_SHOW" | null;
      }> = [];

      if (workshop.apprenticeId && workshop.apprentice) {
        const user = await container.prisma.user.findUnique({
          where: { id: workshop.apprentice.user?.id || "" },
          select: { title: true },
        });

        participants.push({
          id: workshop.apprentice.user?.id || "",
          name: workshop.apprentice.user?.name || null,
          email: workshop.apprentice.user?.email || null,
          title: user?.title || null,
          attendanceStatus:
            (workshop.apprenticeAttendanceStatus as
              | "PENDING"
              | "PRESENT"
              | "NO_SHOW"
              | null) || "PENDING",
        });
      }

      return { participants };
    }),

  updateAttendance: profProcedure
    .input(
      z.object({
        workshopId: z.string(),
        participantId: z.string(),
        attendanceStatus: z.enum(["PENDING", "PRESENT"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const workshop = unwrapResult(
        await container.workshopService.getWorkshopById(input.workshopId)
      );

      if (workshop.creatorId !== ctx.session.user.id) {
        throw new Error("You are not the creator of this workshop");
      }

      if (
        workshop.apprenticeId &&
        workshop.apprentice?.user?.id === input.participantId
      ) {
        if (input.attendanceStatus === "PRESENT" && workshop.date && workshop.time && workshop.duration) {
          const endTime = calculateWorkshopEndTime(
            workshop.date,
            workshop.time,
            workshop.duration
          );
          if (endTime && endTime > new Date()) {
            throw new Error(
              "La présence ne peut être confirmée qu'après la fin de l'atelier"
            );
          }
        }

        const previousStatus = workshop.apprenticeAttendanceStatus;
        const shouldProcessCashback =
          input.attendanceStatus === "PRESENT" &&
          previousStatus !== "PRESENT" &&
          workshop.date &&
          workshop.time &&
          workshop.duration;

        let workshopEndTime: Date | null = null;
        if (shouldProcessCashback) {
          workshopEndTime = calculateWorkshopEndTime(
            workshop.date,
            workshop.time,
            workshop.duration
          );
        }

        const result = await (container.prisma as any).$transaction(
          async (tx: any) => {
            await tx.workshop.update({
              where: { id: input.workshopId },
              data: { apprenticeAttendanceStatus: input.attendanceStatus },
            });

            let titleChanged = false;
            let newTitle: string | null = null;

            if (
              shouldProcessCashback &&
              workshopEndTime &&
              workshop.apprentice?.user?.id
            ) {
              const user = await tx.user.findUnique({
                where: { id: workshop.apprentice.user.id },
                select: { title: true },
              });

              if (user) {
                const previousTitle = user.title || "Explorer";

                const appUser = await tx.app_user.findUnique({
                  where: { userId: workshop.apprentice.user.id },
                  select: { id: true },
                });

                if (appUser) {
                  const presentWorkshopsCount = await tx.workshop.count({
                    where: {
                      apprenticeId: appUser.id,
                      apprenticeAttendanceStatus: "PRESENT",
                    },
                  });

                  const titleThresholds = {
                    EXPLORER: { min: 0, max: 5, title: "Explorer" },
                    CHALLENGER: { min: 6, max: 10, title: "Challenger" },
                    ACHIEVER: { min: 11, max: 20, title: "Achiever" },
                    VISIONARY: { min: 21, max: Infinity, title: "Visionary" },
                  };

                  let calculatedTitle = titleThresholds.EXPLORER.title;
                  if (presentWorkshopsCount >= titleThresholds.VISIONARY.min) {
                    calculatedTitle = titleThresholds.VISIONARY.title;
                  } else if (
                    presentWorkshopsCount >= titleThresholds.ACHIEVER.min &&
                    presentWorkshopsCount <= titleThresholds.ACHIEVER.max
                  ) {
                    calculatedTitle = titleThresholds.ACHIEVER.title;
                  } else if (
                    presentWorkshopsCount >= titleThresholds.CHALLENGER.min &&
                    presentWorkshopsCount <= titleThresholds.CHALLENGER.max
                  ) {
                    calculatedTitle = titleThresholds.CHALLENGER.title;
                  }

                  if (previousTitle !== calculatedTitle) {
                    await tx.user.update({
                      where: { id: workshop.apprentice.user.id },
                      data: { title: calculatedTitle },
                    });
                    titleChanged = true;
                    newTitle = calculatedTitle;
                  }
                }
              }
            }

            return { titleChanged, newTitle };
          }
        );

        if (
          shouldProcessCashback &&
          workshopEndTime &&
          workshop.apprentice?.user?.id
        ) {
          try {
            await container.workshopCashbackService.processCashback(
              input.workshopId,
              workshop.apprentice.user.id,
              workshopEndTime
            );
          } catch (error) {
            console.error("Failed to process cashback:", error);
          }
        }

        if (result.titleChanged && result.newTitle) {
          return {
            success: true,
            titleChanged: true,
            newTitle: result.newTitle,
          };
        }

        return { success: true, titleChanged: false };
      }

      throw new Error("Participant not found");
    }),

  confirmAttendance: profProcedure
    .input(z.object({ workshopId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const workshop = unwrapResult(
        await container.workshopService.getWorkshopById(input.workshopId)
      );

      if (workshop.creatorId !== ctx.session.user.id) {
        throw new Error("You are not the creator of this workshop");
      }

      if (!workshop.date || !workshop.time || !workshop.duration) {
        throw new Error(
          "Le workshop doit avoir une date, une heure et une durée définies pour confirmer l'attendance"
        );
      }

      const workshopEndTime = calculateWorkshopEndTime(
        workshop.date,
        workshop.time,
        workshop.duration
      );

      if (!workshopEndTime) {
        throw new Error("Impossible de calculer l'heure de fin du workshop");
      }

      if (new Date() < workshopEndTime) {
        throw new Error(
          `Le workshop n'est pas encore terminé. L'heure de fin prévue est le ${workshopEndTime.toLocaleString("fr-FR")}`
        );
      }

      if (
        workshop.apprenticeId &&
        workshop.apprenticeAttendanceStatus === "PENDING"
      ) {
        await container.workshopRepository.update(input.workshopId, {
          apprenticeAttendanceStatus: "NO_SHOW",
        } as any);

        if (workshop.apprentice?.user?.id) {
          await container.workshopNoShowPenaltyService.applyPenalty(
            input.workshopId,
            workshop.apprentice.user.id
          );
        }
      }

      await container.workshopRepository.update(input.workshopId, {
        status: "COMPLETED",
      });

      return { success: true, message: "Attendance confirmed" };
    }),
});
