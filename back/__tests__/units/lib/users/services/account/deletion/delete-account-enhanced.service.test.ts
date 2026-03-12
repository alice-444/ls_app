import { describe, it, expect, vi, beforeEach } from "vitest";
import { DeleteAccountEnhancedService } from "../../../../../../../src/lib/users/services/account/deletion/delete-account-enhanced.service";

describe("DeleteAccountEnhancedService", () => {
  const mockAppUserRepo = {
    findByUserId: vi.fn(),
  };
  const mockWorkshopRepo = {
    findByCreatorId: vi.fn(),
    findByApprenticeId: vi.fn(),
  };
  const mockPrisma = {
    $transaction: vi.fn((cb) => cb(mockPrisma)),
    user: {
      update: vi.fn(),
    },
    account: {
      updateMany: vi.fn(),
    },
    deletion_job: {
      create: vi.fn(),
    },
  };
  const mockFileStorage = {
    deleteFile: vi.fn().mockResolvedValue({ ok: true }),
    uploadFile: vi.fn(),
  };
  const mockEmailService = {
    sendEmail: vi.fn().mockResolvedValue({ ok: true }),
  };

  let service: DeleteAccountEnhancedService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new DeleteAccountEnhancedService(
      mockAppUserRepo as any,
      mockWorkshopRepo as any,
      mockPrisma as any,
      mockFileStorage as any,
      mockEmailService as any,
    );
  });

  describe("scrubPII", () => {
    it("should anonymize all PII fields and delete files", async () => {
      const userId = "user-123";
      const appUser = {
        id: "app-user-123",
        userId: userId,
        email: "test@example.com",
        name: "John Doe",
        displayName: "JohnD",
        photoUrl: "https://cloudinary.com/photo.jpg",
        bio: "Old bio",
      };

      mockAppUserRepo.findByUserId.mockResolvedValue(appUser);

      const result = await service.scrubPII(userId);

      expect(result.ok).toBe(true);

      // Verify file deletion
      expect(mockFileStorage.deleteFile).toHaveBeenCalledWith(appUser.photoUrl);

      // Verify user anonymization
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { userId },
        data: expect.objectContaining({
          email: expect.stringContaining(`deleted_${userId}`),
          name: "Deleted User",
          displayName: "Utilisateur Supprimé",
          photoUrl: null,
          bio: null,
          experience: null,
          qualifications: null,
          status: "DELETED",
        }),
      });

      // Verify account password removal
      expect(mockPrisma.account.updateMany).toHaveBeenCalledWith({
        where: { userId },
        data: expect.objectContaining({
          password: null,
        }),
      });
    });

    it("should return 404 if user not found", async () => {
      mockAppUserRepo.findByUserId.mockResolvedValue(null);
      const result = await service.scrubPII("unknown");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(404);
    });
  });

  describe("checkCanDeleteAccount", () => {
    it("should allow deletion if no future workshops", async () => {
      mockAppUserRepo.findByUserId.mockResolvedValue({ id: "app-1" });
      mockWorkshopRepo.findByCreatorId.mockResolvedValue([]);
      mockWorkshopRepo.findByApprenticeId.mockResolvedValue([]);

      const result = await service.checkCanDeleteAccount("user-1");
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.data.canDelete).toBe(true);
    });

    it("should block deletion if there are future workshops", async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      mockAppUserRepo.findByUserId.mockResolvedValue({ id: "app-1" });
      mockWorkshopRepo.findByCreatorId.mockResolvedValue([
        { date: tomorrow, status: "PUBLISHED" },
      ]);
      mockWorkshopRepo.findByApprenticeId.mockResolvedValue([]);

      const result = await service.checkCanDeleteAccount("user-1");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.canDelete).toBe(false);
        expect(result.data.reason).toContain("cancel your bookings");
      }
    });
  });
});
