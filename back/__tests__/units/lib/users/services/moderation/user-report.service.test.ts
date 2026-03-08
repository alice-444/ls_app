import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserReportService } from "@/lib/users/services/moderation/user-report.service";

describe("UserReportService", () => {
  const mockReportRepo = {
    create: vi.fn(),
    findByReporter: vi.fn(),
  };

  const mockAppUserRepo = {
    findByUserId: vi.fn(),
    findByAppUserId: vi.fn(),
    findUserNameByUserId: vi.fn(),
  };

  const mockAuditLogService = {
    record: vi.fn(),
  };

  const mockNotificationService = {
    notifyAdmin: vi.fn(),
  };

  let service: UserReportService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new UserReportService(
      mockReportRepo as any,
      mockAppUserRepo as any,
      mockAuditLogService as any,
      mockNotificationService as any
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
        .mockResolvedValueOnce({ id: "app-reporter", name: "Reporter" })
        .mockResolvedValueOnce({ id: "app-reported", name: "Reported" });
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
      expect(mockNotificationService.notifyAdmin).toHaveBeenCalled();
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
  });
});
