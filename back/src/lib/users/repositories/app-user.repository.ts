export interface AppUserData {
  id: string;
  userId: string;
  name: string | null;
  displayName: string | null;
  role: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  photoUrl?: string | null;
  deletedAt?: Date | null;
}

export interface CreateAppUserInput {
  id: string;
  userId: string;
  status: string;
  role?: string | null;
}

export interface UpdateAppUserInput {
  role?: string;
  status?: string;
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
  findByEmail(email: string): Promise<AppUserData | null>;
  findByAppUserId(userId: string): Promise<AppUserData | null>;
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

const UPDATABLE_FIELDS = [
  "role", "status", "bio", "domain", "photoUrl", "qualifications",
  "experience", "socialMediaLinks", "areasOfExpertise", "mentorshipTopics",
  "calendlyLink", "isPublished", "publishedAt", "displayName",
  "studyDomain", "studyProgram", "iceBreakerTags", "deletedAt",
] as const;

function buildPrismaUpdateData(input: UpdateAppUserInput): Record<string, unknown> {
  const data: Record<string, unknown> = { updatedAt: new Date() };
  for (const field of UPDATABLE_FIELDS) {
    if ((input as Record<string, unknown>)[field] !== undefined) {
      data[field] = (input as Record<string, unknown>)[field];
    }
  }
  return data;
}

function mapToAppUserData(raw: any): AppUserData {
  return {
    id: raw.id,
    userId: raw.userId,
    name: raw.name || null,
    displayName: raw.displayName || null,
    role: raw.role,
    status: raw.status,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    photoUrl: raw.photoUrl ?? null,
    deletedAt: raw.deletedAt ?? null,
  };
}

const APP_USER_BASE_SELECT = {
  id: true,
  userId: true,
  name: true,
  displayName: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  photoUrl: true,
  deletedAt: true,
} as const;

export class PrismaAppUserRepository implements AppUserRepository {
  constructor(private readonly prisma: any) {}

  async findByUserId(userId: string): Promise<AppUserData | null> {
    if (!this.prisma) {
      throw new Error("Prisma client is not initialized");
    }

    const appUser = await this.prisma.user.findUnique({
      where: { userId },
      select: APP_USER_BASE_SELECT,
    });

    return appUser ? mapToAppUserData(appUser) : null;
  }

  async findByEmail(email: string): Promise<AppUserData | null> {
    if (!this.prisma) {
      throw new Error("Prisma client is not initialized");
    }

    const appUser = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: APP_USER_BASE_SELECT,
    });

    return appUser ? mapToAppUserData(appUser) : null;
  }

  async findByAppUserId(userId: string): Promise<AppUserData | null> {
    if (!this.prisma) {
      throw new Error("Prisma client is not initialized");
    }

    const appUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: APP_USER_BASE_SELECT,
    });

    return appUser ? mapToAppUserData(appUser) : null;
  }

  async create(input: CreateAppUserInput): Promise<AppUserData> {
    const now = new Date();
    const appUser = await this.prisma.user.create({
      data: {
        id: input.id,
        userId: input.userId,
        status: input.status,
        role: input.role ?? null,
        createdAt: now,
        updatedAt: now,
      },
    });

    return mapToAppUserData(appUser);
  }

  async update(
    userId: string,
    input: UpdateAppUserInput
  ): Promise<AppUserData> {
    const appUser = await this.prisma.user.update({
      where: { userId },
      data: buildPrismaUpdateData(input),
    });

    return mapToAppUserData(appUser);
  }

  async upsert(
    userId: string,
    createInput: CreateAppUserInput,
    updateInput: UpdateAppUserInput = {}
  ): Promise<AppUserData> {
    const now = new Date();
    const appUser = await this.prisma.user.upsert({
      where: { userId },
      create: {
        id: createInput.id,
        userId: createInput.userId,
        status: createInput.status,
        role: createInput.role ?? null,
        createdAt: now,
        updatedAt: now,
      },
      update: buildPrismaUpdateData(updateInput),
    });

    return mapToAppUserData(appUser);
  }

  async findIdentityCardByUserId(userId: string): Promise<{
    displayName: string | null;
    studyDomain: string | null;
    studyProgram: string | null;
    photoUrl: string | null;
    iceBreakerTags: string[] | null;
  } | null> {
    const appUser = await this.prisma.user.findUnique({
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
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    return user?.name || null;
  }
}
