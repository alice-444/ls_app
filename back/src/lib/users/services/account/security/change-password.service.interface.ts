import type { Result } from "../../../../common";

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface IChangePasswordService {
  changePassword(
    userId: string,
    input: ChangePasswordInput
  ): Promise<Result<{ success: boolean }>>;
}
