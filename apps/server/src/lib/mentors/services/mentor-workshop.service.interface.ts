import type { Result } from "../../common";

export interface IMentorWorkshopService {
  getMentorPublicWorkshops(mentorId: string): Promise<Result<any>>;
}

