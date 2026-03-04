import type { PrismaClient } from '@/lib/prisma';
import type {
  IUserBlockRepository,
  UserBlockEntity,
} from "./user-block.repository.interface";
import { generateInternalId } from "../../../utils/id-generator";
import { logger } from "../../../common/logger";

export class PrismaUserBlockRepository implements IUserBlockRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(blockerId: string, blockedId: string): Promise<UserBlockEntity> {
    const block = await this.prisma.user_block.create({
      data: {
        id: generateInternalId(),
        blockerId,
        blockedId,
        createdAt: new Date(),
      },
    });

    return {
      id: block.id,
      blockerId: block.blockerId,
      blockedId: block.blockedId,
      createdAt: block.createdAt,
    };
  }

  async delete(blockerId: string, blockedId: string): Promise<void> {
    await this.prisma.user_block.deleteMany({
      where: {
        blockerId,
        blockedId,
      },
    });
  }

  async findBlock(
    blockerId: string,
    blockedId: string
  ): Promise<UserBlockEntity | null> {
    const block = await this.prisma.user_block.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId,
          blockedId,
        },
      },
    });

    if (!block) return null;

    return {
      id: block.id,
      blockerId: block.blockerId,
      blockedId: block.blockedId,
      createdAt: block.createdAt,
    };
  }

  async findBlocksByBlocker(blockerId: string): Promise<UserBlockEntity[]> {
    try {
      logger.debug("findBlocksByBlocker called", { blockerId });

      const blocks = await this.prisma.user_block.findMany({
        where: { blockerId },
        orderBy: { createdAt: "desc" },
      });

      logger.debug("findBlocksByBlocker result", {
        blockerId,
        count: blocks.length,
      });

      return blocks.map((block: any) => ({
        id: block.id,
        blockerId: block.blockerId,
        blockedId: block.blockedId,
        createdAt: block.createdAt,
      }));
    } catch (error) {
      logger.error("Error in findBlocksByBlocker", error, { blockerId });
      throw error;
    }
  }

  async findBlocksByBlocked(blockedId: string): Promise<UserBlockEntity[]> {
    const blocks = await this.prisma.user_block.findMany({
      where: { blockedId },
      orderBy: { createdAt: "desc" },
    });

    return blocks.map((block: any) => ({
      id: block.id,
      blockerId: block.blockerId,
      blockedId: block.blockedId,
      createdAt: block.createdAt,
    }));
  }

  async isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    const block = await this.findBlock(blockerId, blockedId);
    return block !== null;
  }

  async findBlockedUserIds(blockerId: string): Promise<string[]> {
    const blocks = await this.findBlocksByBlocker(blockerId);
    return blocks.map((block) => block.blockedId);
  }
}
