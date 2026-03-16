import type { Result } from "../../../common";

export interface WorkshopParticipant {
  id: string;
  name: string | null;
  email: string | null;
  title: string | null;
  attendanceStatus: "PENDING" | "PRESENT" | "NO_SHOW" | null;
}

export interface AttendanceUpdateResult {
  success: boolean;
  titleChanged: boolean;
  newTitle?: string | null;
}

export interface IWorkshopAttendanceService {
  getWorkshopParticipants(
    userId: string,
    workshopId: string
  ): Promise<Result<{ participants: WorkshopParticipant[] }>>;

  updateAttendance(
    userId: string,
    workshopId: string,
    participantId: string,
    attendanceStatus: "PENDING" | "PRESENT" | "NO_SHOW"
  ): Promise<Result<AttendanceUpdateResult>>;

  confirmAttendance(
    userId: string,
    workshopId: string
  ): Promise<Result<{ success: boolean; message: string }>>;
}
