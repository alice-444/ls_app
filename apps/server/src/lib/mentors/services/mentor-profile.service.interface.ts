import type { Result } from "../../common";

export interface IMentorProfileService {
  getPublishedMentorById(mentorId: string): Promise<Result<any>>;
}

