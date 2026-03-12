/**
 * @file user.ts
 * Centralized types for User entities.
 */
export type UserRole = "MENTOR" | "APPRENTICE" | "ADMIN";
export type UserStatus = "PENDING" | "ACTIVE" | "BLOCKED" | "DELETED";
export interface UserBasicInfo {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole | null;
  status: UserStatus;
  photoUrl: string | null;
  displayName: string | null;
}
export interface MentorPublicProfile extends UserBasicInfo {
  bio: string | null;
  domain: string | null;
  title: string | null;
  areasOfExpertise: string[] | null;
  mentorshipTopics: string[] | null;
  qualifications: string | null;
  experience: string | null;
  socialMediaLinks: Record<string, string> | null;
  iceBreakerTags: string[] | null;
  isPublished: boolean;
  publishedAt: Date | string | null;
  averageRating?: number | null;
  feedbackCount?: number;
  workshopsCount?: number;
}
/** Legacy support for front/src/types/workshop-components.ts */
export type MentorBasic = Pick<
  MentorPublicProfile,
  | "id"
  | "name"
  | "displayName"
  | "bio"
  | "domain"
  | "photoUrl"
  | "areasOfExpertise"
  | "mentorshipTopics"
  | "workshopsCount"
>;
