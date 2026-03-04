import type { Result } from "../../../common";

export interface IMentorProfileService {
  getPublicProfile(mentorId: string, viewerUserId?: string): Promise<Result<any>>;
}
