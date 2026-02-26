import type { Result } from "../../../common";
import { failure, success } from "../../../common";
import { handleError, createErrorContext } from "../../../common/error-handler";
import type {
  IWorkshopAttendanceService,
  WorkshopParticipant,
  AttendanceUpdateResult,
} from "./workshop-attendance.service.interface";
import type { IWorkshopService } from "../workshop.service.interface";
import type { IWorkshopRepository } from "../../repositories/workshop.repository.interface";
import type { IUserTitleService } from "../../../users/services/profile/user-title.service.interface";
import type { IWorkshopCashbackService } from "../rewards/workshop-cashback.service.interface";
import type { IWorkshopNoShowPenaltyService } from "../rewards/workshop-no-show-penalty.service.interface";
import type { PrismaClient } from "../../../../../prisma/generated/client/client";
import { calculateWorkshopEndTime } from "../../utils/workshop-helpers";
import { logger } from "../../../common/logger";

export class WorkshopAttendanceService implements IWorkshopAttendanceService {
  constructor(
    private readonly workshopService: IWorkshopService,
    private readonly workshopRepository: IWorkshopRepository,
    private readonly userTitleService: IUserTitleService,
    private readonly workshopCashbackService: IWorkshopCashbackService,
    private readonly workshopNoShowPenaltyService: IWorkshopNoShowPenaltyService,
    private readonly prisma: PrismaClient
  ) {}

  async getWorkshopParticipants(
    userId: string,
    workshopId: string
  ): Promise<Result<{ participants: WorkshopParticipant[] }>> {
    try {
      const workshopResult =
        await this.workshopService.getWorkshopById(workshopId);
      if (!workshopResult.ok) return workshopResult as any;
      const workshop = workshopResult.data;

      if (workshop.creatorId !== userId) {
        return failure("You are not the creator of this workshop", 403);
      }

      const participants: WorkshopParticipant[] = [];

      if (workshop.apprenticeId && workshop.apprentice) {
        const user = await this.prisma.user.findUnique({
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

      return success({ participants });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("getWorkshopParticipants", {
          userId,
          resourceId: workshopId,
        })
      );
    }
  }

  async updateAttendance(
    userId: string,
    workshopId: string,
    participantId: string,
    attendanceStatus: "PENDING" | "PRESENT"
  ): Promise<Result<AttendanceUpdateResult>> {
    try {
      const workshopResult =
        await this.workshopService.getWorkshopById(workshopId);
      if (!workshopResult.ok) return workshopResult as any;
      const workshop = workshopResult.data;

      if (workshop.creatorId !== userId) {
        return failure("You are not the creator of this workshop", 403);
      }

      if (
        !workshop.apprenticeId ||
        workshop.apprentice?.user?.id !== participantId
      ) {
        return failure("Participant not found", 404);
      }

      if (
        attendanceStatus === "PRESENT" &&
        workshop.date &&
        workshop.time &&
        workshop.duration
      ) {
        const endTime = calculateWorkshopEndTime(
          workshop.date,
          workshop.time,
          workshop.duration
        );
        if (endTime && endTime > new Date()) {
          return failure(
            "La présence ne peut être confirmée qu'après la fin de l'atelier",
            400
          );
        }
      }

      const previousStatus = workshop.apprenticeAttendanceStatus;
      const shouldProcessCashback =
        attendanceStatus === "PRESENT" &&
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

      await (this.prisma as any).workshop.update({
        where: { id: workshopId },
        data: { apprenticeAttendanceStatus: attendanceStatus },
      });

      let titleChanged = false;
      let newTitle: string | null = null;

      if (shouldProcessCashback && workshop.apprentice?.user?.id) {
        const titleResult =
          await this.userTitleService.updateTitleBasedOnWorkshops(
            workshop.apprentice.user.id
          );

        if (titleResult.ok && titleResult.data.titleChanged) {
          titleChanged = true;
          newTitle = titleResult.data.newTitle;
        }

        if (workshopEndTime) {
          try {
            await this.workshopCashbackService.processCashback(
              workshopId,
              workshop.apprentice.user.id,
              workshopEndTime
            );
          } catch (error) {
            logger.error("Failed to process cashback", { workshopId, error });
          }
        }
      }

      return success({ success: true, titleChanged, newTitle });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("updateAttendance", {
          userId,
          resourceId: workshopId,
        })
      );
    }
  }

  async confirmAttendance(
    userId: string,
    workshopId: string
  ): Promise<Result<{ success: boolean; message: string }>> {
    try {
      const workshopResult =
        await this.workshopService.getWorkshopById(workshopId);
      if (!workshopResult.ok) return workshopResult as any;
      const workshop = workshopResult.data;

      if (workshop.creatorId !== userId) {
        return failure("You are not the creator of this workshop", 403);
      }

      if (!workshop.date || !workshop.time || !workshop.duration) {
        return failure(
          "Le workshop doit avoir une date, une heure et une durée définies pour confirmer l'attendance",
          400
        );
      }

      const workshopEndTime = calculateWorkshopEndTime(
        workshop.date,
        workshop.time,
        workshop.duration
      );

      if (!workshopEndTime) {
        return failure(
          "Impossible de calculer l'heure de fin du workshop",
          500
        );
      }

      if (new Date() < workshopEndTime) {
        return failure(
          `Le workshop n'est pas encore terminé. L'heure de fin prévue est le ${workshopEndTime.toLocaleString("fr-FR")}`,
          400
        );
      }

      if (
        workshop.apprenticeId &&
        workshop.apprenticeAttendanceStatus === "PENDING"
      ) {
        await this.workshopRepository.update(workshopId, {
          apprenticeAttendanceStatus: "NO_SHOW",
        } as any);

        if (workshop.apprentice?.user?.id) {
          await this.workshopNoShowPenaltyService.applyPenalty(
            workshopId,
            workshop.apprentice.user.id
          );
        }
      }

      await this.workshopRepository.update(workshopId, {
        status: "COMPLETED",
      });

      return success({ success: true, message: "Attendance confirmed" });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("confirmAttendance", {
          userId,
          resourceId: workshopId,
        })
      );
    }
  }
}
