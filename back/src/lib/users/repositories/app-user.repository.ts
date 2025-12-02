import type { Role, AppUserStatus } from "../../../../prisma/generated/client/client";

export interface AppUserData {
  id: string;
  userId: string;
  role: Role | null;
  status: AppUserStatus;
  createdAt: Date;
  updatedAt: Date;
  photoUrl?: string | null;
  deletedAt?: Date | null;
}

export interface CreateAppUserInput {
  id: string;
  userId: string;
  status: AppUserStatus;
  role?: Role | null;
}

export interface UpdateAppUserInput {
  role?: Role;
  status?: AppUserStatus;
  bio?: string | null;
  domain?: string | null;
  photoUrl?: string | null;
  qualifications?: string | null;
  experience?: string | null;
  socialMediaLinks?: Record<string, string> | null;
  areasOfExpertise?: string[] | null;
  mentorshipTopics?: string[] | null;
  calendlyLink?: string | null;
  isPublished?: boolean;
  publishedAt?: Date | null;
  displayName?: string | null;
  studyDomain?: string | null;
  studyProgram?: string | null;
  iceBreakerTags?: string[] | null;
  deletedAt?: Date | null;
}

export interface AppUserRepository {
  findByUserId(userId: string): Promise<AppUserData | null>;
  findByAppUserId(appUserId: string): Promise<AppUserData | null>;
  create(input: CreateAppUserInput): Promise<AppUserData>;
  update(userId: string, input: UpdateAppUserInput): Promise<AppUserData>;
  upsert(
    userId: string,
    createInput: CreateAppUserInput,
    updateInput?: UpdateAppUserInput
  ): Promise<AppUserData>;
  findIdentityCardByUserId(userId: string): Promise<{
    displayName: string | null;
    studyDomain: string | null;
    studyProgram: string | null;
    photoUrl: string | null;
    iceBreakerTags: string[] | null;
  } | null>;
  findUserNameByUserId(userId: string): Promise<string | null>;
}

export class PrismaAppUserRepository implements AppUserRepository {
  constructor(private readonly prisma: any) {}

  async findByUserId(userId: string): Promise<AppUserData | null> {
    if (!this.prisma) {
      throw new Error("Prisma client is not initialized");
    }

    const appUser = await (this.prisma as any).app_user.findUnique({
      where: { userId },
      select: {
        id: true,
        userId: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        photoUrl: true,
        deletedAt: true,
      },
    });

    if (!appUser) return null;

    const result: AppUserData = {
      id: appUser.id,
      userId: appUser.userId,
      role: appUser.role as Role | null,
      status: appUser.status,
      createdAt: appUser.createdAt,
      updatedAt: appUser.updatedAt,
      photoUrl: appUser.photoUrl ?? null,
      deletedAt: appUser.deletedAt ?? null,
    };

    return result;
  }

  async findByAppUserId(appUserId: string): Promise<AppUserData | null> {
    if (!this.prisma) {
      throw new Error("Prisma client is not initialized");
    }

    const appUser = await (this.prisma as any).app_user.findUnique({
      where: { id: appUserId },
      select: {
        id: true,
        userId: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!appUser) return null;

    return {
      id: appUser.id,
      userId: appUser.userId,
      role: appUser.role as Role | null,
      status: appUser.status,
      createdAt: appUser.createdAt,
      updatedAt: appUser.updatedAt,
    };
  }

  async create(input: CreateAppUserInput): Promise<AppUserData> {
    const now = new Date();
    const appUser = await (this.prisma as any).app_user.create({
      data: {
        id: input.id,
        userId: input.userId,
        status: input.status,
        role: input.role ?? null,
        createdAt: now,
        updatedAt: now,
      },
    });

    return {
      id: appUser.id,
      userId: appUser.userId,
      role: appUser.role as Role | null,
      status: appUser.status,
      createdAt: appUser.createdAt,
      updatedAt: appUser.updatedAt,
    };
  }

  async update(
    userId: string,
    input: UpdateAppUserInput
  ): Promise<AppUserData> {
    const now = new Date();
    const appUser = await (this.prisma as any).app_user.update({
      where: { userId },
      data: {
        ...(input.role !== undefined && { role: input.role as any }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.bio !== undefined && { bio: input.bio }),
        ...(input.domain !== undefined && { domain: input.domain }),
        ...(input.photoUrl !== undefined && { photoUrl: input.photoUrl }),
        ...(input.qualifications !== undefined && { qualifications: input.qualifications }),
        ...(input.experience !== undefined && { experience: input.experience }),
        ...(input.socialMediaLinks !== undefined && { socialMediaLinks: input.socialMediaLinks as any }),
        ...(input.areasOfExpertise !== undefined && { areasOfExpertise: input.areasOfExpertise as any }),
        ...(input.mentorshipTopics !== undefined && { mentorshipTopics: input.mentorshipTopics as any }),
        ...(input.calendlyLink !== undefined && { calendlyLink: input.calendlyLink }),
        ...(input.isPublished !== undefined && { isPublished: input.isPublished }),
        ...(input.publishedAt !== undefined && { publishedAt: input.publishedAt }),
        ...(input.displayName !== undefined && { displayName: input.displayName }),
        ...(input.studyDomain !== undefined && { studyDomain: input.studyDomain }),
        ...(input.studyProgram !== undefined && { studyProgram: input.studyProgram }),
        ...(input.iceBreakerTags !== undefined && { iceBreakerTags: input.iceBreakerTags as any }),
        ...(input.deletedAt !== undefined && { deletedAt: input.deletedAt }),
        updatedAt: now,
      },
    });

    return {
      id: appUser.id,
      userId: appUser.userId,
      role: appUser.role as Role | null,
      status: appUser.status,
      createdAt: appUser.createdAt,
      updatedAt: appUser.updatedAt,
      photoUrl: appUser.photoUrl ?? null,
      deletedAt: appUser.deletedAt ?? null,
    };
  }

  async upsert(
    userId: string,
    createInput: CreateAppUserInput,
    updateInput: UpdateAppUserInput = {}
  ): Promise<AppUserData> {
    const now = new Date();
    const appUser = await (this.prisma as any).app_user.upsert({
      where: { userId },
      create: {
        id: createInput.id,
        userId: createInput.userId,
        status: createInput.status,
        role: createInput.role ?? null,
        createdAt: now,
        updatedAt: now,
      },
      update: {
        ...(updateInput.role !== undefined && {
          role: updateInput.role as any,
        }),
        ...(updateInput.status !== undefined && { status: updateInput.status }),
        ...(updateInput.bio !== undefined && { bio: updateInput.bio }),
        ...(updateInput.domain !== undefined && { domain: updateInput.domain }),
        ...(updateInput.photoUrl !== undefined && { photoUrl: updateInput.photoUrl }),
        ...(updateInput.qualifications !== undefined && { qualifications: updateInput.qualifications }),
        ...(updateInput.experience !== undefined && { experience: updateInput.experience }),
        ...(updateInput.socialMediaLinks !== undefined && { socialMediaLinks: updateInput.socialMediaLinks as any }),
        ...(updateInput.areasOfExpertise !== undefined && { areasOfExpertise: updateInput.areasOfExpertise as any }),
        ...(updateInput.mentorshipTopics !== undefined && { mentorshipTopics: updateInput.mentorshipTopics as any }),
        ...(updateInput.calendlyLink !== undefined && { calendlyLink: updateInput.calendlyLink }),
        ...(updateInput.isPublished !== undefined && { isPublished: updateInput.isPublished }),
        ...(updateInput.publishedAt !== undefined && { publishedAt: updateInput.publishedAt }),
        ...(updateInput.displayName !== undefined && { displayName: updateInput.displayName }),
        ...(updateInput.studyDomain !== undefined && { studyDomain: updateInput.studyDomain }),
        ...(updateInput.studyProgram !== undefined && { studyProgram: updateInput.studyProgram }),
        ...(updateInput.iceBreakerTags !== undefined && { iceBreakerTags: updateInput.iceBreakerTags as any }),
        ...(updateInput.deletedAt !== undefined && { deletedAt: updateInput.deletedAt }),
        updatedAt: now,
      },
    });

    return {
      id: appUser.id,
      userId: appUser.userId,
      role: appUser.role as Role | null,
      status: appUser.status,
      createdAt: appUser.createdAt,
      updatedAt: appUser.updatedAt,
    };
  }

  async findIdentityCardByUserId(userId: string): Promise<{
    displayName: string | null;
    studyDomain: string | null;
    studyProgram: string | null;
    photoUrl: string | null;
    iceBreakerTags: string[] | null;
  } | null> {
    const appUser = await (this.prisma as any).app_user.findUnique({
      where: { userId },
      select: {
        displayName: true,
        studyDomain: true,
        studyProgram: true,
        photoUrl: true,
        iceBreakerTags: true,
      },
    });

    if (!appUser) return null;

    return {
      displayName: appUser.displayName || null,
      studyDomain: appUser.studyDomain || null,
      studyProgram: appUser.studyProgram || null,
      photoUrl: appUser.photoUrl || null,
      iceBreakerTags: (appUser.iceBreakerTags as string[]) || null,
    };
  }

  async findUserNameByUserId(userId: string): Promise<string | null> {
    const user = await (this.prisma as any).user.findUnique({
      where: { id: userId },
      select: {
        name: true,
      },
    });

    return user?.name || null;
  }
}
