import type { Result } from "../../../common";

export interface IMentorProfileService {
  getPublicProfile(mentorId: string, viewerUserId?: string): Promise<Result<any>>;
  getPublicMentors(filters?: {
    domain?: string;
    topic?: string;
    limit?: number;
    cursor?: string;
  }): Promise<Result<{ mentors: any[]; nextCursor?: string }>>;
}
