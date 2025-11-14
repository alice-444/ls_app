export interface IAppUserRepository {
  findByUserId(userId: string): Promise<AppUserEntity | null>;
  update(userId: string, data: Partial<AppUserUpdateData>): Promise<AppUserEntity>;
}

export interface AppUserEntity {
  id: string;
  userId: string;
  role: "PROF" | "APPRENANT" | "ADMIN" | null;
  status: "ACTIVE" | "SUSPENDED" | "PENDING";
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  deletionRequestedAt: Date | null;
  deletionReason: string | null;
  bio: string | null;
  domain: string | null;
  photoUrl: string | null;
  qualifications: string | null;
  experience: string | null;
  socialMediaLinks: any;
  areasOfExpertise: any;
  mentorshipTopics: any;
  calendlyLink: string | null;
  isPublished: boolean;
  publishedAt: Date | null;
}

export interface AppUserUpdateData {
  role?: "PROF" | "APPRENANT" | "ADMIN" | null;
  status?: "ACTIVE" | "SUSPENDED" | "PENDING";
  bio?: string | null;
  domain?: string | null;
  photoUrl?: string | null;
  qualifications?: string | null;
  experience?: string | null;
  socialMediaLinks?: any;
  areasOfExpertise?: any;
  mentorshipTopics?: any;
  calendlyLink?: string | null;
  isPublished?: boolean;
  publishedAt?: Date | null;
}

