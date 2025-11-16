export interface WorkshopRequestEntity {
  id: string;
  title: string;
  description: string | null;
  message: string | null;
  preferredDate: Date | null;
  preferredTime: string | null;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
  apprenticeId: string;
  mentorId: string;
  workshopId: string | null;
  createdAt: Date;
  updatedAt: Date;
  apprentice?: {
    id: string;
    user?: {
      id: string;
      name: string | null;
      email: string | null;
    };
  };
  mentor?: {
    id: string;
    user?: {
      id: string;
      name: string | null;
      email: string | null;
    };
  };
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
  workshopId?: string | null;
}

export interface IWorkshopRequestRepository {
  create(input: CreateWorkshopRequestInput): Promise<WorkshopRequestEntity>;
  findById(id: string): Promise<WorkshopRequestEntity | null>;
  findByApprenticeId(apprenticeId: string): Promise<WorkshopRequestEntity[]>;
  findByMentorId(mentorId: string): Promise<WorkshopRequestEntity[]>;
  findByWorkshopId(workshopId: string): Promise<WorkshopRequestEntity[]>;
  update(id: string, input: UpdateWorkshopRequestInput): Promise<WorkshopRequestEntity>;
}

