import { Result } from "../../../../common";

export interface UpdatePublicProfileInput {
  photoUrl?: string | null;
  name?: string;
  bio?: string | null;
}

export interface IUpdateProfileService {
  updatePublicProfile(
    userId: string,
    input: UpdatePublicProfileInput
  ): Promise<Result<{ success: boolean }>>;
}
