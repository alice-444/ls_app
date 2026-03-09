import type { PrismaClient } from '@/lib/prisma';
import { IExportDataService, UserDataExport } from "./export-data.service.interface";
import { success, failure, Result } from "../../../common/types";
import { handleError, createErrorContext } from "../../../common/error-handler";

export class ExportDataService implements IExportDataService {
  constructor(private readonly prisma: PrismaClient) {}

  async exportUserData(userId: string): Promise<Result<UserDataExport>> {
    try {
      // 1. Fetch User and Account - Using internal ID (id) from session
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          accounts: true,
        }
      });

      if (!user) {
        return failure("Utilisateur non trouvé", 404);
      }

      const internalId = user.id;

      // 2. Fetch Workshops
      const workshopsAsMentor = await (this.prisma as any).workshop.findMany({
        where: { creatorId: internalId }
      });

      const workshopsAsApprentice = await (this.prisma as any).workshop.findMany({
        where: { apprenticeId: internalId }
      });

      // 3. Fetch Workshop Requests
      const sentRequests = await (this.prisma as any).workshop_request.findMany({
        where: { apprenticeId: internalId }
      });

      const receivedRequests = await (this.prisma as any).workshop_request.findMany({
        where: { mentorId: internalId }
      });

      // 4. Fetch Feedbacks
      const givenFeedbacks = await (this.prisma as any).mentor_feedback.findMany({
        where: { apprenticeId: internalId }
      });

      const receivedFeedbacks = await (this.prisma as any).mentor_feedback.findMany({
        where: { mentorId: internalId }
      });

      // 5. Fetch Messaging
      const conversations = await (this.prisma as any).conversation.findMany({
        where: {
          OR: [
            { participant1Id: internalId },
            { participant2Id: internalId }
          ]
        }
      });

      const messages = await (this.prisma as any).message.findMany({
        where: { senderId: internalId }
      });

      // 6. Fetch Connections
      const sentConnections = await (this.prisma as any).user_connection.findMany({
        where: { requesterId: internalId }
      });

      const receivedConnections = await (this.prisma as any).user_connection.findMany({
        where: { receiverId: internalId }
      });

      // 7. Fetch Credits
      const transactions = await (this.prisma as any).credit_transaction.findMany({
        where: { userId: internalId }
      });

      // 8. Fetch Notifications
      const notifications = await (this.prisma as any).notification.findMany({
        where: { userId: internalId }
      });

      // 9. Fetch Moderation
      const blocks = await (this.prisma as any).user_block.findMany({
        where: { blockerId: internalId }
      });

      const blockedBy = await (this.prisma as any).user_block.findMany({
        where: { blockedId: internalId }
      });

      const reportsMade = await (this.prisma as any).user_report.findMany({
        where: { reporterUserId: internalId }
      });

      const reportsReceived = await (this.prisma as any).user_report.findMany({
        where: { reportedUserId: internalId }
      });

      // Sanitize profile/account (exclude passwords, secrets)
      const { accounts, ...profileData } = user;
      const sanitizedAccounts = (accounts || []).map((acc: any) => ({
        id: acc.id,
        accountId: acc.accountId,
        email: acc.email,
        isEmailVerified: acc.isEmailVerified,
        createdAt: acc.createdAt,
        updatedAt: acc.updatedAt,
      }));

      const exportData: UserDataExport = {
        profile: profileData,
        account: sanitizedAccounts,
        workshops: {
          asMentor: workshopsAsMentor,
          asApprentice: workshopsAsApprentice,
        },
        workshopRequests: {
          sent: sentRequests,
          received: receivedRequests,
        },
        feedbacks: {
          given: givenFeedbacks,
          received: receivedFeedbacks,
        },
        conversations,
        messages,
        connections: {
          sent: sentConnections,
          received: receivedConnections,
        },
        credits: {
          balance: user.creditBalance,
          transactions,
        },
        notifications,
        moderation: {
          blocks,
          blockedBy,
          reportsMade,
          reportsReceived,
        },
        exportedAt: new Date(),
      };

      return success(exportData);
    } catch (error) {
      return handleError(error, createErrorContext("exportUserData", { userId }));
    }
  }
}
