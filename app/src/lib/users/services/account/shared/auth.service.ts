import { auth } from "../../../../auth";
import type {
  IAuthService,
  SignInEmailInput,
  BetterAuthChangePasswordInput,
} from "./auth.service.interface";
import { Result, failure, success } from "../../../../common";

export class BetterAuthService implements IAuthService {
  async verifyCredentials(
    input: SignInEmailInput
  ): Promise<Result<{ userId: string }>> {
    try {
      const headers = new Headers();
      headers.set("content-type", "application/json");

      const data = await auth.api.signInEmail({
        body: {
          email: input.email,
          password: input.password,
        },
        headers,
      });

      if (!data || !data.user) {
        return failure("Invalid credentials", 401);
      }

      return success({ userId: data.user.id });
    } catch (error: any) {
      if (error?.status === 401 || error?.message?.includes("password")) {
        return failure("Invalid credentials", 401);
      }
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return failure(`Authentication failed: ${errorMessage}`, 500);
    }
  }

  async changePassword(
    input: BetterAuthChangePasswordInput
  ): Promise<Result<{ success: boolean }>> {
    try {
      const headers = new Headers();
      headers.set("content-type", "application/json");

      await auth.api.changePassword({
        body: {
          currentPassword: input.currentPassword,
          newPassword: input.newPassword,
          revokeOtherSessions: input.revokeOtherSessions ?? true,
        },
        headers,
      });

      return success({ success: true });
    } catch (error: any) {
      if (error?.status === 401 || error?.message?.includes("password")) {
        return failure("Current password is incorrect", 401);
      }
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return failure(`Failed to change password: ${errorMessage}`, 500);
    }
  }
}
