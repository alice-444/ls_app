import type { AppUserRepository } from "../../repositories";

export interface UserInfo {
  userId: string;
  name: string | null;
  displayName: string | null;
  photoUrl: string | null;
  role: "MENTOR" | "APPRENANT" | "ADMIN" | null;
  appId: string;
}

export class UserInfoEnricher {
  constructor(
    private readonly appUserRepository: AppUserRepository
  ) {}

  async enrichByAppUserId(appUserId: string): Promise<UserInfo | null> {
    const appUser = await this.appUserRepository.findByAppUserId(appUserId);
    if (!appUser) return null;

    const [name, identityCard] = await Promise.all([
      this.appUserRepository.findUserNameByUserId(appUser.userId),
      this.appUserRepository.findIdentityCardByUserId(appUser.userId),
    ]);

    return {
      userId: appUser.userId,
      name,
      displayName: identityCard?.displayName || null,
      photoUrl: identityCard?.photoUrl || null,
      role: appUser.role,
      appId: appUser.id,
    };
  }
}
