import type { PrismaClient } from '@/lib/prisma';
import { IExportDataService, UserDataExport } from "./export-data.service.interface";
import { success, failure, Result } from "../../../common/types";
import { handleError, createErrorContext } from "../../../common/error-handler";

export class ExportDataService implements IExportDataService {
  constructor(private readonly prisma: PrismaClient) {}

  async exportUserData(userId: string): Promise<Result<UserDataExport>> {
    try {
      // 1. Fetch User and Account
      const user = await this.prisma.user.findUnique({
        where: { userId },
        include: {
          account: true,
        }
      });

      if (!user) {
        return failure("Utilisateur non trouvé", 404);
      }

      const internalId = user.id;

      // 2. Fetch Workshops
      const workshopsAsMentor = await this.prisma.workshop.findMany({
        where: { creatorId: internalId }
      });

      const workshopsAsApprentice = await this.prisma.workshop.findMany({
        where: { apprenticeId: internalId }
      });

      // 3. Fetch Workshop Requests
      const sentRequests = await this.prisma.workshop_request.findMany({
        where: { apprenticeId: internalId }
      });

      const receivedRequests = await this.prisma.workshop_request.findMany({
        where: { mentorId: internalId }
      });

      // 4. Fetch Feedbacks
      const givenFeedbacks = await this.prisma.mentor_feedback.findMany({
        where: { apprenticeId: internalId }
      });

      const receivedFeedbacks = await this.prisma.mentor_feedback.findMany({
        where: { mentorId: internalId }
      });

      // 5. Fetch Messaging
      const conversations = await this.prisma.conversation.findMany({
        where: {
          OR: [
            { participant1Id: internalId },
            { participant2Id: internalId }
          ]
        }
      });

      const messages = await this.prisma.message.findMany({
        where: { senderId: internalId }
      });

      // 6. Fetch Connections
      const sentConnections = await this.prisma.user_connection.findMany({
        where: { requesterId: internalId }
      });

      const receivedConnections = await this.prisma.user_connection.findMany({
        where: { receiverId: internalId }
      });

      // 7. Fetch Credits
      const transactions = await this.prisma.credit_transaction.findMany({
        where: { userId: internalId }
      });

      // 8. Fetch Notifications
      const notifications = await this.prisma.notification.findMany({
        where: { userId: internalId }
      });

      // 9. Fetch Moderation
      const blocks = await this.prisma.user_block.findMany({
        where: { blockerId: internalId }
      });

      const blockedBy = await this.prisma.user_block.findMany({
        where: { blockedId: internalId }
      });

      const reportsMade = await this.prisma.user_report.findMany({
        where: { reporterUserId: internalId }
      });

      const reportsReceived = await this.prisma.user_report.findMany({
        where: { reportedUserId: internalId }
      });

      // Sanitize profile/account (exclude passwords, secrets)
      const { account, ...profileData } = user;
      const sanitizedAccount = account ? {
        id: account.id,
        accountId: account.accountId,
        email: account.email,
        isEmailVerified: account.isEmailVerified,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      } : null;

      const exportData: UserDataExport = {
        profile: profileData,
        account: sanitizedAccount,
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
