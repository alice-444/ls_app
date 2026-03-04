import type { Result } from "../../../common";

export interface IMentorProfileService {
  getPublicProfile(mentorId: string): Promise<Result<any>>;
}
