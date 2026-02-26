import type { Result } from "../../../common";

export interface IWorkshopLifecycleService {
  createWorkshop(
    userId: string,
    input: unknown
  ): Promise<Result<{ workshopId: string }>>;

  updateWorkshop(
    userId: string,
    input: unknown
  ): Promise<Result<{ success: boolean }>>;

  publishWorkshop(
    userId: string,
    input: unknown
  ): Promise<Result<{ success: boolean; publishedAt: Date }>>;

  unpublishWorkshop(
    userId: string,
    input: unknown
  ): Promise<Result<{ success: boolean }>>;

  deleteWorkshop(
    userId: string,
    input: unknown
  ): Promise<Result<{ success: boolean }>>;
}
