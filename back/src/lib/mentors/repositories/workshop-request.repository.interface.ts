import type { AppUserData } from "../../users/repositories/app-user.repository";

export interface WorkshopRequestEntity {
  id: string;
  title: string;
  description: string | null;
  message: string | null;
  preferredDate: Date | null;
  preferredTime: string | null;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
  rejectionReason: string | null;
  apprenticeId: string;
  mentorId: string;
  workshopId: string | null;
  createdAt: Date;
  updatedAt: Date;
  apprentice?: AppUserData;
  mentor?: AppUserData;
}

export interface CreateWorkshopRequestInput {
  title: string;
  description?: string | null;
  message?: string | null;
  preferredDate?: Date | null;
  preferredTime?: string | null;
  apprenticeId: string;
  mentorId: string;
  workshopId?: string | null;
}

export interface UpdateWorkshopRequestInput {
  status?: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
  rejectionReason?: string | null;
  workshopId?: string | null;
  title?: string;
  description?: string | null;
  message?: string | null;
  preferredDate?: Date | null;
  preferredTime?: string | null;
  mentorId?: string;
}

export interface IWorkshopRequestRepository {
  create(input: CreateWorkshopRequestInput): Promise<WorkshopRequestEntity>;
  findById(id: string): Promise<WorkshopRequestEntity | null>;
  findByIdWithLock(id: string, tx?: any): Promise<WorkshopRequestEntity | null>;
  findByApprenticeId(apprenticeId: string): Promise<WorkshopRequestEntity[]>;
  findByMentorId(mentorId: string): Promise<WorkshopRequestEntity[]>;
  findByWorkshopId(workshopId: string): Promise<WorkshopRequestEntity[]>;
  countAcceptedByWorkshopId(workshopId: string, tx?: any): Promise<number>;
  update(id: string, input: UpdateWorkshopRequestInput): Promise<WorkshopRequestEntity>;
  updateWithTransaction(id: string, input: UpdateWorkshopRequestInput, tx: any): Promise<WorkshopRequestEntity>;
}

