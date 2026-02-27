import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../../../../src/lib/common/prisma", () => ({ prisma: {} }));
vi.mock("../../../../../../src/lib/common/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { UserReportService } from "../../../../../../src/lib/users/services/moderation/user-report.service";

describe("UserReportService", () => {
  const mockReportRepo = {
    create: vi.fn(),
    findByReporter: vi.fn(),
  };

  const mockAppUserRepo = {
    findByUserId: vi.fn(),
    findByAppUserId: vi.fn(),
  };

  const mockAuditLogService = {
    record: vi.fn(),
  };

  let service: UserReportService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new UserReportService(
      mockReportRepo as any,
      mockAppUserRepo as any,
      mockAuditLogService as any
    );
  });

  describe("createReport", () => {
    it("returns 400 when reporter tries to report themselves", async () => {
      const result = await service.createReport({
        reporterUserId: "user-1",
        reportedUserId: "user-1",
        reason: "HARASSMENT",
      });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(400);
    });

    it("returns 404 when reporter user not found", async () => {
      mockAppUserRepo.findByUserId.mockResolvedValue(null);

      const result = await service.createReport({
        reporterUserId: "user-1",
        reportedUserId: "user-2",
        reason: "SPAM",
      });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(404);
    });

    it("returns 404 when reported user not found", async () => {
      mockAppUserRepo.findByUserId
        .mockResolvedValueOnce({ id: "app-1" })
        .mockResolvedValueOnce(null);

      const result = await service.createReport({
        reporterUserId: "user-1",
        reportedUserId: "user-2",
        reason: "SPAM",
      });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(404);
    });

    it("creates report successfully", async () => {
      mockAppUserRepo.findByUserId
        .mockResolvedValueOnce({ id: "app-reporter" })
        .mockResolvedValueOnce({ id: "app-reported" });
      mockReportRepo.create.mockResolvedValue({ id: "report-1" });

      const result = await service.createReport({
        reporterUserId: "user-1",
        reportedUserId: "user-2",
        reason: "HARASSMENT",
        details: "Inappropriate behavior",
      });

      expect(result.ok).toBe(true);
      if (result.ok) expect(result.data.reportId).toBe("report-1");
      expect(mockReportRepo.create).toHaveBeenCalledWith({
        reporterId: "app-reporter",
        reportedId: "app-reported",
        reason: "HARASSMENT",
        details: "Inappropriate behavior",
        messageId: null,
      });
    });

    it("records audit log when service is available", async () => {
      mockAppUserRepo.findByUserId
        .mockResolvedValueOnce({ id: "app-reporter" })
        .mockResolvedValueOnce({ id: "app-reported" });
      mockReportRepo.create.mockResolvedValue({ id: "report-1" });

      await service.createReport({
        reporterUserId: "user-1",
        reportedUserId: "user-2",
        reason: "SPAM",
      });

      expect(mockAuditLogService.record).toHaveBeenCalledWith(
        "user-1",
        "USER_REPORTED",
        expect.objectContaining({
          reportId: "report-1",
          reportedUserId: "user-2",
          reason: "SPAM",
        })
      );
    });

    it("creates report with messageId when provided", async () => {
      mockAppUserRepo.findByUserId
        .mockResolvedValueOnce({ id: "app-reporter" })
        .mockResolvedValueOnce({ id: "app-reported" });
      mockReportRepo.create.mockResolvedValue({ id: "report-1" });

      await service.createReport({
        reporterUserId: "user-1",
        reportedUserId: "user-2",
        reason: "INAPPROPRIATE_CONTENT",
        messageId: "msg-123",
      });

      expect(mockReportRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ messageId: "msg-123" })
      );
    });
  });

  describe("getReportsByReporter", () => {
    it("returns 404 when user not found", async () => {
      mockAppUserRepo.findByUserId.mockResolvedValue(null);

      const result = await service.getReportsByReporter("user-1");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(404);
    });

    it("returns reports with resolved user IDs", async () => {
      mockAppUserRepo.findByUserId.mockResolvedValue({ id: "app-1" });
      mockReportRepo.findByReporter.mockResolvedValue([
        {
          id: "report-1",
          reportedId: "app-reported",
          reason: "SPAM",
          details: null,
          status: "PENDING",
          createdAt: new Date("2025-06-01"),
        },
      ]);
      mockAppUserRepo.findByAppUserId.mockResolvedValue({
        userId: "reported-user-id",
      });

      const result = await service.getReportsByReporter("user-1");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0].reportedUserId).toBe("reported-user-id");
        expect(result.data[0].reason).toBe("SPAM");
      }
    });

    it("falls back to reportedId when appUser not found", async () => {
      mockAppUserRepo.findByUserId.mockResolvedValue({ id: "app-1" });
      mockReportRepo.findByReporter.mockResolvedValue([
        {
          id: "report-1",
          reportedId: "app-unknown",
          reason: "HARASSMENT",
          details: null,
          status: "PENDING",
          createdAt: new Date("2025-06-01"),
        },
      ]);
      mockAppUserRepo.findByAppUserId.mockResolvedValue(null);

      const result = await service.getReportsByReporter("user-1");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data[0].reportedUserId).toBe("app-unknown");
      }
    });
  });
});
