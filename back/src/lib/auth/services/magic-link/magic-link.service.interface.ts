import type { Result } from "../../../common";

export interface IMagicLinkService {
  requestLink(email: string): Promise<Result<{ success: boolean }>>;
}
