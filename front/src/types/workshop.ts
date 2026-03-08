export interface WorkshopBasic {
  id: string;
  title: string;
  description: string | null;
  date: Date | string | null;
  time: string | null;
  duration: number | null;
  location: string | null;
  isVirtual: boolean;
  maxParticipants: number | null;
  status?: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
  topic?: string | null;
  materialsNeeded?: string | null;
  creditCost?: number | null;
}

export interface WorkshopWithFeedback extends WorkshopBasic {
  averageRating: number | null;
  feedbackCount: number;
}

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

