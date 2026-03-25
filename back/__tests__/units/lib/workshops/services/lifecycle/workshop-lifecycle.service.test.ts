import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../../../../src/lib/common/prisma", () => ({ prisma: {} }));
vi.mock("../../../../../../src/lib/common/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { WorkshopLifecycleService } from "../../../../../../src/lib/workshops/services/lifecycle/workshop-lifecycle.service";

const WORKSHOP_ID = "cktvw5720000010mscuid1234";

describe("WorkshopLifecycleService", () => {
  const mockWorkshopRepo = {
    create: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  const mockAccessGuard = {
    verifyMentorAccess: vi.fn(),
    verifyWorkshopOwnership: vi.fn(),
    verifyApprenticeAccess: vi.fn(),
  };

  let service: WorkshopLifecycleService;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    service = new WorkshopLifecycleService(
      mockWorkshopRepo as any,
      mockAccessGuard as any,
    );
  });

  describe("createWorkshop", () => {
    it("returns validation error for invalid input", async () => {
      const result = await service.createWorkshop("user-1", {});
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(400);
    });

    it("returns failure when access check fails", async () => {
      mockAccessGuard.verifyMentorAccess.mockResolvedValue({
        ok: false,
        error: "Not a mentor",
        status: 403,
      });

      const result = await service.createWorkshop("user-1", {
        title: "Mon atelier de test",
      });
      expect(result.ok).toBe(false);
    });

    it("returns failure when appUser is null", async () => {
      mockAccessGuard.verifyMentorAccess.mockResolvedValue({
        ok: true,
        data: { appUser: null },
      });

      const result = await service.createWorkshop("user-1", {
        title: "Mon atelier de test",
      });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(404);
    });

    it("creates workshop successfully", async () => {
      mockAccessGuard.verifyMentorAccess.mockResolvedValue({
        ok: true,
        data: { appUser: { id: "app-1" } },
      });
      mockWorkshopRepo.create.mockResolvedValue({ id: "ws-new" });

      const result = await service.createWorkshop("user-1", {
        title: "Mon atelier de test",
      });
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.data.workshopId).toBe("ws-new");
      expect(mockWorkshopRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ creatorId: "app-1" }),
      );
    });
  });

  describe("updateWorkshop", () => {
    it("returns validation error for invalid input", async () => {
      const result = await service.updateWorkshop("user-1", {});
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(400);
    });

    it("returns failure when ownership check fails", async () => {
      mockAccessGuard.verifyWorkshopOwnership.mockResolvedValue({
        ok: false,
        error: "Not authorized",
        status: 403,
      });

      const result = await service.updateWorkshop("user-1", {
        workshopId: WORKSHOP_ID,
        title: "Updated Title Here",
      });
      expect(result.ok).toBe(false);
    });

    it("returns failure when date is not minimum tomorrow", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-06-15T12:00:00Z"));

      mockAccessGuard.verifyWorkshopOwnership.mockResolvedValue({
        ok: true,
        data: { appUser: { id: "app-1" }, workshopId: WORKSHOP_ID },
      });

      const result = await service.updateWorkshop("user-1", {
        workshopId: WORKSHOP_ID,
        date: new Date("2025-06-15"),
      });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(400);

      vi.useRealTimers();
    });

    it("updates workshop successfully", async () => {
      mockAccessGuard.verifyWorkshopOwnership.mockResolvedValue({
        ok: true,
        data: { appUser: { id: "app-1" }, workshopId: WORKSHOP_ID },
      });
      mockWorkshopRepo.update.mockResolvedValue({});

      const result = await service.updateWorkshop("user-1", {
        workshopId: WORKSHOP_ID,
        title: "Updated Title Here",
      });
      expect(result.ok).toBe(true);
      expect(mockWorkshopRepo.update).toHaveBeenCalledWith(
        WORKSHOP_ID,
        expect.objectContaining({ title: "Updated Title Here" }),
      );
    });
  });

  describe("publishWorkshop", () => {
    it("returns failure when ownership check fails", async () => {
      mockAccessGuard.verifyWorkshopOwnership.mockResolvedValue({
        ok: false,
        error: "Not authorized",
        status: 403,
      });

      const result = await service.publishWorkshop("user-1", {
        workshopId: WORKSHOP_ID,
      });
      expect(result.ok).toBe(false);
    });

    it("returns failure when workshop not found", async () => {
      mockAccessGuard.verifyWorkshopOwnership.mockResolvedValue({
        ok: true,
        data: { appUser: { id: "app-1" }, workshopId: WORKSHOP_ID },
      });
      mockWorkshopRepo.findById.mockResolvedValue(null);

      const result = await service.publishWorkshop("user-1", {
        workshopId: WORKSHOP_ID,
      });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(404);
    });

    it("returns failure when required fields are missing", async () => {
      mockAccessGuard.verifyWorkshopOwnership.mockResolvedValue({
        ok: true,
        data: { appUser: { id: "app-1" }, workshopId: WORKSHOP_ID },
      });
      mockWorkshopRepo.findById.mockResolvedValue({
        title: "AB",
        description: null,
        date: null,
        time: null,
        duration: null,
      });

      const result = await service.publishWorkshop("user-1", {
        workshopId: WORKSHOP_ID,
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.status).toBe(400);
        expect(result.error).toContain("Impossible de publier");
      }
    });

    it("publishes workshop when all fields are valid", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-06-01T12:00:00Z"));

      mockAccessGuard.verifyWorkshopOwnership.mockResolvedValue({
        ok: true,
        data: { appUser: { id: "app-1" }, workshopId: WORKSHOP_ID },
      });
      mockWorkshopRepo.findById.mockResolvedValue({
        title: "Mon atelier complet",
        description:
          "Une description suffisamment longue pour passer la validation minimum",
        topic: "Informatique",
        date: new Date("2025-06-20"),
        time: "14:00",
        duration: 60,
      });
      mockWorkshopRepo.update.mockResolvedValue({});

      const result = await service.publishWorkshop("user-1", {
        workshopId: WORKSHOP_ID,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.success).toBe(true);
        expect(result.data.publishedAt).toBeInstanceOf(Date);
      }
      expect(mockWorkshopRepo.update).toHaveBeenCalledWith(
        WORKSHOP_ID,
        expect.objectContaining({ status: "PUBLISHED" }),
      );

      vi.useRealTimers();
    });

    it("returns failure when date is not minimum tomorrow", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-06-15T12:00:00Z"));

      mockAccessGuard.verifyWorkshopOwnership.mockResolvedValue({
        ok: true,
        data: { appUser: { id: "app-1" }, workshopId: WORKSHOP_ID },
      });
      mockWorkshopRepo.findById.mockResolvedValue({
        title: "Mon atelier complet",
        description:
          "Une description suffisamment longue pour passer la validation",
        date: new Date("2025-06-15"),
        time: "14:00",
        duration: 60,
      });

      const result = await service.publishWorkshop("user-1", {
        workshopId: WORKSHOP_ID,
      });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(400);

      vi.useRealTimers();
    });
  });

  describe("unpublishWorkshop", () => {
    it("returns failure when workshop is not published", async () => {
      mockAccessGuard.verifyWorkshopOwnership.mockResolvedValue({
        ok: true,
        data: { appUser: { id: "app-1" }, workshopId: WORKSHOP_ID },
      });
      mockWorkshopRepo.findById.mockResolvedValue({ status: "DRAFT" });

      const result = await service.unpublishWorkshop("user-1", {
        workshopId: WORKSHOP_ID,
      });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(400);
    });

    it("unpublishes a published workshop", async () => {
      mockAccessGuard.verifyWorkshopOwnership.mockResolvedValue({
        ok: true,
        data: { appUser: { id: "app-1" }, workshopId: WORKSHOP_ID },
      });
      mockWorkshopRepo.findById.mockResolvedValue({ status: "PUBLISHED" });
      mockWorkshopRepo.update.mockResolvedValue({});

      const result = await service.unpublishWorkshop("user-1", {
        workshopId: WORKSHOP_ID,
      });
      expect(result.ok).toBe(true);
      expect(mockWorkshopRepo.update).toHaveBeenCalledWith(WORKSHOP_ID, {
        status: "DRAFT",
        publishedAt: null,
      });
    });
  });

  describe("deleteWorkshop", () => {
    it("returns failure when ownership check fails", async () => {
      mockAccessGuard.verifyWorkshopOwnership.mockResolvedValue({
        ok: false,
        error: "Not authorized",
        status: 403,
      });

      const result = await service.deleteWorkshop("user-1", {
        workshopId: WORKSHOP_ID,
      });
      expect(result.ok).toBe(false);
    });

    it("deletes workshop successfully", async () => {
      mockAccessGuard.verifyWorkshopOwnership.mockResolvedValue({
        ok: true,
        data: { appUser: { id: "app-1" }, workshopId: WORKSHOP_ID },
      });
      mockWorkshopRepo.delete.mockResolvedValue(undefined);

      const result = await service.deleteWorkshop("user-1", {
        workshopId: WORKSHOP_ID,
      });
      expect(result.ok).toBe(true);
      expect(mockWorkshopRepo.delete).toHaveBeenCalledWith(WORKSHOP_ID);
    });
  });
});
