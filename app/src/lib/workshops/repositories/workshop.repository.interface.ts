import type { AppUserData } from "../../users/repositories/app-user.repository";

export type WorkshopStatus = "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";

export interface WorkshopEntity {
  id: string;
  title: string;
  description: string | null;
  topic: string | null;
  date: Date | null;
  time: string | null;
  duration: number | null;
  location: string | null;
  isVirtual: boolean;
  maxParticipants: number | null;
  materialsNeeded: string | null;
  status: WorkshopStatus;
  creatorId: string;
  apprenticeId: string | null;
  requestId: string | null;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  dailyRoomId?: string | null;
  dailyRoomLastActivityAt?: Date | null;
  apprenticeAttendanceStatus?: "PENDING" | "PRESENT" | "NO_SHOW" | null;
  creditCost?: number | null;
  
  // Strict relations
  creator?: AppUserData | null;
  apprentice?: AppUserData | null;
}

export interface CreateWorkshopInput {
  title: string;
  description?: string | null;
  topic?: string | null;
  date?: Date | null;
  time?: string | null;
  duration?: number | null;
  location?: string | null;
  isVirtual?: boolean;
  maxParticipants?: number | null;
  materialsNeeded?: string | null;
  creditCost?: number | null;
  creatorId: string;
  apprenticeId?: string | null;
  requestId?: string | null;
}

export interface UpdateWorkshopInput {
  title?: string;
  description?: string;
  topic?: string | null;
  date?: Date;
  time?: string;
  duration?: number;
  location?: string | null;
  isVirtual?: boolean;
  maxParticipants?: number | null;
  materialsNeeded?: string | null;
  creditCost?: number | null;
  status?: WorkshopStatus;
  publishedAt?: Date | null;
  apprenticeId?: string | null;
  dailyRoomId?: string | null;
  dailyRoomLastActivityAt?: Date | null;
  apprenticeAttendanceStatus?: "PENDING" | "PRESENT" | "NO_SHOW" | null;
}

export interface IWorkshopRepository {
  create(input: CreateWorkshopInput): Promise<WorkshopEntity>;
  findById(id: string): Promise<WorkshopEntity | null>;
  findByCreatorId(
    creatorId: string,
    status?: WorkshopStatus
  ): Promise<WorkshopEntity[]>;
  findByApprenticeId(apprenticeId: string): Promise<WorkshopEntity[]>;
  findPublished(): Promise<WorkshopEntity[]>;
  update(
    id: string,
    input: UpdateWorkshopInput,
    tx?: any
  ): Promise<WorkshopEntity>;
  delete(id: string): Promise<void>;
  checkCreatorOwnership(
    workshopId: string,
    creatorId: string
  ): Promise<boolean>;
  removeApprentice(workshopId: string, tx?: any): Promise<void>;
  findWorkshopBetweenMentorAndApprentice(
    mentorAppUserId: string,
    apprenticeAppUserId: string
  ): Promise<WorkshopEntity | null>;
  getAllTopics(): Promise<string[]>;
}
