import type { Role, AppUserStatus } from "../../../../prisma/generated/client/client";

export interface AppUserData {
  id: string;
  userId: string;
  role: Role | null;
  status: AppUserStatus;
  createdAt: Date;
  updatedAt: Date;
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
}

export interface AppUserRepository {
  findByUserId(userId: string): Promise<AppUserData | null>;
  create(input: CreateAppUserInput): Promise<AppUserData>;
  update(userId: string, input: UpdateAppUserInput): Promise<AppUserData>;
  upsert(
    userId: string,
    createInput: CreateAppUserInput,
    updateInput?: UpdateAppUserInput
  ): Promise<AppUserData>;
}

export class PrismaAppUserRepository implements AppUserRepository {
  constructor(private readonly prisma: any) {}

  async findByUserId(userId: string): Promise<AppUserData | null> {
    console.log("Repository findByUserId - this.prisma:", this.prisma, "type:", typeof this.prisma);
    console.log("Repository findByUserId - this.prisma keys:", this.prisma ? Object.keys(this.prisma).slice(0, 10) : "prisma is undefined");
    
    if (!this.prisma) {
      console.error("Repository findByUserId - ERROR: this.prisma is undefined!");
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
      },
    });

    if (!appUser) return null;

    const result = {
      id: appUser.id,
      userId: appUser.userId,
      role: appUser.role as Role | null,
      status: appUser.status,
      createdAt: appUser.createdAt,
      updatedAt: appUser.updatedAt,
    };

    return result;
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
}
