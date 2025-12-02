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
}

export interface WorkshopWithFeedback extends WorkshopBasic {
  averageRating: number | null;
  feedbackCount: number;
}

