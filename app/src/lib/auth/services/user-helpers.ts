import { prisma } from "@/lib/common";
import { Result, failure } from "@/lib/common";
import type { AppUserRepository } from "@/lib/users/repositories";

/**
 * Verifies that a user exists by their userId (Account ID).
 */
export async function verifyUserExists(
  userId: string
): Promise<Result<{ user: { id: string; userId: string } }>> {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ id: userId }, { userId }],
    },
  });

  if (!user) {
    return failure("User not found", 404);
  }

  return {
    ok: true,
    data: {
      user: {
        id: user.id,
        userId: user.userId || user.id,
      },
    },
  };
}

export async function verifyMentorUser(
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

  if (appUser.role !== "MENTOR") {
    return failure("Only users with MENTOR role can perform this action", 403);
  }

  if (appUser.status !== "ACTIVE") {
    return failure("User account is not active", 403);
  }

  return { ok: true, data: { appUser } };
}
