import { prisma } from "./prisma";
import { generateInternalId } from "../utils/id-generator";
import { logger } from "./logger";

export interface IAuditLogService {
  record(params: {
    adminId: string;
    action: string;
    targetId?: string;
    details: Record<string, unknown>;
  }): Promise<void>;
}

export class AuditLogService implements IAuditLogService {
  async record(params: {
    adminId: string;
    action: string;
    targetId?: string;
    details: Record<string, unknown>;
  }): Promise<void> {
    try {
      await (prisma as any).audit_log.create({
        data: {
          id: generateInternalId(),
          adminId: params.adminId,
          action: params.action,
          targetId: params.targetId ?? null,
          details: params.details,
          createdAt: new Date(),
        },
      });
    } catch (error) {
      logger.error("Failed to record audit log", error, {
        adminId: params.adminId,
        action: params.action,
        targetId: params.targetId,
        details: params.details,
      });
    }
  }
}
