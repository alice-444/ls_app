import type { Result } from "../../../common";

export interface IUserTitleService {
  updateTitleBasedOnWorkshops(userId: string): Promise<
    Result<{
      newTitle: string;
      previousTitle: string | null;
      titleChanged: boolean;
    }>
  >;

  getTitleForCount(count: number): string;
}
