export interface IWorkshopRepository {
  create(input: CreateWorkshopInput): Promise<WorkshopEntity>;
  findById(id: string): Promise<WorkshopEntity | null>;
  findByCreatorId(creatorId: string): Promise<WorkshopEntity[]>;
  findPublished(): Promise<WorkshopEntity[]>;
  update(id: string, input: UpdateWorkshopInput): Promise<WorkshopEntity>;
  delete(id: string): Promise<void>;
  checkCreatorOwnership(workshopId: string, creatorId: string): Promise<boolean>;
}

export interface CreateWorkshopInput {
  title: string;
  description?: string | null;
  date?: Date | null;
  time?: string | null;
  duration?: number | null;
  location?: string | null;
  isVirtual?: boolean;
  maxParticipants?: number | null;
  materialsNeeded?: string | null;
  creatorId: string;
}

export interface UpdateWorkshopInput {
  title?: string;
  description?: string;
  date?: Date;
  time?: string;
  duration?: number;
  location?: string | null;
  isVirtual?: boolean;
  maxParticipants?: number | null;
  materialsNeeded?: string | null;
  status?: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
  publishedAt?: Date | null;
}

export interface WorkshopEntity {
  id: string;
  title: string;
  description: string | null;
  date: Date | null;
  time: string | null;
  duration: number | null;
  location: string | null;
  isVirtual: boolean;
  maxParticipants: number | null;
  materialsNeeded: string | null;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  creator?: any;
}

