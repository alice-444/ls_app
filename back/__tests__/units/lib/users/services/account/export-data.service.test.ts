import { describe, it, expect, vi, beforeEach } from "vitest";
import { ExportDataService } from "../../../../../../src/lib/users/services/account/export-data.service";

describe("ExportDataService", () => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
    },
    workshop: {
      findMany: vi.fn(),
    },
    workshop_request: {
      findMany: vi.fn(),
    },
    mentor_feedback: {
      findMany: vi.fn(),
    },
    conversation: {
      findMany: vi.fn(),
    },
    message: {
      findMany: vi.fn(),
    },
    user_connection: {
      findMany: vi.fn(),
    },
    credit_transaction: {
      findMany: vi.fn(),
    },
    notification: {
      findMany: vi.fn(),
    },
    user_block: {
      findMany: vi.fn(),
    },
    user_report: {
      findMany: vi.fn(),
    },
  };

  let service: ExportDataService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ExportDataService(mockPrisma as any);
  });

  it("should return failure if user is not found", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const result = await service.exportUserData("non-existent");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Utilisateur non trouvé");
      expect(result.status).toBe(404);
    }
  });

  it("should aggregate all user data correctly", async () => {
    const mockUser = {
      id: "internal-1",
      userId: "user-1",
      name: "John Doe",
      email: "john@example.com",
      creditBalance: 100,
      account: {
        id: "acc-1",
        accountId: "user-1",
        email: "john@example.com",
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    };

    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockPrisma.workshop.findMany.mockResolvedValue([]);
    mockPrisma.workshop_request.findMany.mockResolvedValue([]);
    mockPrisma.mentor_feedback.findMany.mockResolvedValue([]);
    mockPrisma.conversation.findMany.mockResolvedValue([{ id: "conv-1" }]);
    mockPrisma.message.findMany.mockResolvedValue([{ id: "msg-1", content: "Hello" }]);
    mockPrisma.user_connection.findMany.mockResolvedValue([]);
    mockPrisma.credit_transaction.findMany.mockResolvedValue([{ id: "tx-1", amount: 10 }]);
    mockPrisma.notification.findMany.mockResolvedValue([]);
    mockPrisma.user_block.findMany.mockResolvedValue([]);
    mockPrisma.user_report.findMany.mockResolvedValue([]);

    const result = await service.exportUserData("user-1");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.profile.name).toBe("John Doe");
      expect(result.data.account?.email).toBe("john@example.com");
      expect(result.data.conversations).toHaveLength(1);
      expect(result.data.messages).toHaveLength(1);
      expect(result.data.credits.balance).toBe(100);
      expect(result.data.credits.transactions).toHaveLength(1);
      expect(result.data.exportedAt).toBeInstanceOf(Date);
    }

    // Verify Prisma calls
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId: "user-1" }
    }));
    expect(mockPrisma.workshop.findMany).toHaveBeenCalledTimes(2); // as mentor and as apprentice
  });

  it("should handle errors gracefully", async () => {
    mockPrisma.user.findUnique.mockRejectedValue(new Error("Database error"));

    const result = await service.exportUserData("user-1");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeDefined();
    }
  });
});
