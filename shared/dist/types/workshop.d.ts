/**
 * @file workshop.ts
 * Centralized types for Workshop entities.
 */
export type WorkshopStatus = "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
/** Basic information for any workshop display */
export interface WorkshopBase {
  id: string;
  title: string;
  description: string | null;
  topic: string | null;
  date: Date | string | null;
  time: string | null;
  duration: number | null;
  location: string | null;
  isVirtual: boolean;
  maxParticipants: number | null;
  status: WorkshopStatus;
  createdAt: Date | string;
  updatedAt?: Date | string;
}
/** User information structure (Mentor/Apprentice) */
export interface WorkshopUser {
  id: string;
  name: string | null;
  displayName?: string | null;
  email?: string | null;
  photoUrl?: string | null;
  user?: {
    name: string | null;
  } | null;
}
/** Full workshop entity as received from backend with relations */
export interface WorkshopDetailed extends WorkshopBase {
  creatorId: string;
  apprenticeId: string | null;
  apprenticeAttendanceStatus?: "PENDING" | "PRESENT" | "NO_SHOW" | null;
  creditCost?: number | null;
  materialsNeeded?: string | null;
  averageRating?: number | null;
  feedbackCount?: number;
  creator?: WorkshopUser | null;
  apprentice?: WorkshopUser | null;
}
/** Type for workshop requests (Apprentice to Mentor) */
export interface WorkshopRequest {
  id: string;
  title: string;
  description?: string | null;
  message?: string | null;
  preferredDate?: Date | string | null;
  preferredTime?: string | null;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
  rejectionReason?: string | null;
  apprenticeId: string;
  mentorId: string;
  workshopId?: string | null;
  createdAt: Date | string;
  updatedAt?: Date | string;
  apprentice?: {
    id?: string;
    user?: {
      id?: string;
      name: string | null;
      email?: string | null;
    };
  };
  mentor?: {
    id?: string;
    user?: {
      id?: string;
      name: string | null;
      email?: string | null;
    };
  };
}
export interface WorkshopParticipant {
  id: string;
  name: string | null;
  email: string | null;
  title: string | null;
  attendanceStatus: "PENDING" | "PRESENT" | "NO_SHOW" | null;
}
