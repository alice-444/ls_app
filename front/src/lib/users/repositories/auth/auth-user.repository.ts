import type { IAuthUserRepository } from "./auth-user.repository.interface";
import type { PrismaClient } from '@/lib/prisma';

export class PrismaAuthUserRepository implements IAuthUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });

    return user;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, name: true },
    });

    return user;
  }

  async updateEmail(userId: string, newEmail: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: newEmail.toLowerCase(),
        updatedAt: new Date(),
      },
    });
  }

  async updateName(userId: string, name: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: name.trim(),
        updatedAt: new Date(),
      },
    });
  }
}

