import { prisma } from "@/lib/common";
import { Result, failure } from "@/lib/common";
import type { AppUserRepository } from "@/lib/users/repositories";

export async function verifyUserExists(
  userId: string
): Promise<Result<{ user: { id: string } }>> {
  const user = await (prisma as any).user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return failure("User not found", 404);
  }

  return { ok: true, data: { user } };
}

export async function verifyProfUser(
  appUserRepository: AppUserRepository,
  userId: string
): Promise<
  Result<{
    appUser: Awaited<ReturnType<AppUserRepository["findByUserId"]>>;
  }>
> {
  const appUser = await appUserRepository.findByUserId(userId);

  if (!appUser) {
    return failure(
      "AppUser not found. Please complete role selection first.",
      400
    );
  }

  if (appUser.role !== "PROF") {
    return failure("Only users with PROF role can perform this action", 403);
  }

  if (appUser.status !== "ACTIVE") {
    return failure("User account is not active", 403);
  }

  return { ok: true, data: { appUser } };
}
