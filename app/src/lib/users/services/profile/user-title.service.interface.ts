import type { Result } from "../../../common";

export interface UserTitleUpdateResult {
  newTitle: string;
  previousTitle: string | null;
  titleChanged: boolean;
  workshopCount: number;
}

export interface IUserTitleService {
  updateTitleBasedOnWorkshops(userId: string): Promise<Result<UserTitleUpdateResult>>;

  getTitleForCount(count: number): string;
}
