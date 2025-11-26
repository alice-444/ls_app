import { prisma } from "./prisma";
import { generateInternalId } from "../utils/id-generator";
import { logger } from "./logger";

export interface IAuditLogService {
  record(
    userId: string,
    type: string,
    meta?: Record<string, unknown>
  ): Promise<void>;
}

export class AuditLogService implements IAuditLogService {
  async record(
    userId: string,
    type: string,
    meta?: Record<string, unknown>
  ): Promise<void> {
    try {
      await (prisma as any).audit_log.create({
        data: {
          id: generateInternalId(),
          userId,
          type,
          meta: meta ?? null,
          createdAt: new Date(),
        },
      });
    } catch (error) {
      logger.error("Failed to record audit log", error, {
        userId,
        type,
        meta,
      });
    }
  }
}
