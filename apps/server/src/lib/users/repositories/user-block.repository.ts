import type {
  IUserBlockRepository,
  UserBlockEntity,
} from "./user-block.repository.interface";
import { generateInternalId } from "../../utils/id-generator";
import { prisma } from "../../common";
import { logger } from "../../common/logger";

export class PrismaUserBlockRepository implements IUserBlockRepository {
  private readonly prismaClient: any;

  constructor() {
    try {
      logger.debug("Initializing user_block repository", {
        usingAccelerate: !!process.env.PRISMA_ACCELERATE_URL,
      });

      this.prismaClient = prisma as any;

      if (!this.prismaClient.user_block) {
        const availableModels = Object.keys(this.prismaClient).filter(
          (key) =>
            !key.startsWith("$") &&
            !key.startsWith("_") &&
            typeof this.prismaClient[key] === "object"
        );
        logger.error("user_block model not found in Prisma client", undefined, {
          availableModels: availableModels.slice(0, 20),
          clientType: typeof this.prismaClient,
        });
        throw new Error(
          `user_block model not available. Available models: ${availableModels
            .slice(0, 10)
            .join(", ")}...`
        );
      }

      logger.debug("user_block repository initialized successfully", {
        hasUserBlockModel: !!this.prismaClient.user_block,
      });
    } catch (error) {
      logger.error("Error initializing user_block repository", error);
      throw error;
    }
  }

  async create(blockerId: string, blockedId: string): Promise<UserBlockEntity> {
    const block = await this.prismaClient.user_block.create({
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
    await this.prismaClient.user_block.deleteMany({
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
    const block = await this.prismaClient.user_block.findUnique({
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

      if (!this.prismaClient.user_block) {
        const availableModels = Object.keys(this.prismaClient).filter(
          (key) =>
            !key.startsWith("$") &&
            !key.startsWith("_") &&
            typeof this.prismaClient[key] === "object"
        );
        logger.error("user_block model not found in Prisma client", undefined, {
          blockerId,
          availableModels,
        });
        throw new Error(
          `user_block model not available. Available models: ${availableModels.join(
            ", "
          )}`
        );
      }

      const blocks = await this.prismaClient.user_block.findMany({
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
    const blocks = await this.prismaClient.user_block.findMany({
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
