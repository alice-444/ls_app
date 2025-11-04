import type { Role } from "../../../../prisma/generated/client/client";
import type { AppUserStatus } from "../../../../prisma/generated/client/client";

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
    const appUser = await this.prisma.appUser.findUnique({
      where: { userId },
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
    const appUser = await this.prisma.appUser.create({
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
    const appUser = await this.prisma.appUser.update({
      where: { userId },
      data: {
        ...(input.role !== undefined && { role: input.role as any }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.bio !== undefined && { bio: input.bio }),
        ...(input.domain !== undefined && { domain: input.domain }),
        ...(input.photoUrl !== undefined && { photoUrl: input.photoUrl }),
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
    const appUser = await this.prisma.appUser.upsert({
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
