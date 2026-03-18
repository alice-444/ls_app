import type { PrismaClient } from "@/lib/prisma-server";
import {
  IExportDataService,
  UserDataExport,
} from "./export-data.service.interface";
import { success, failure, Result } from "../../../common/types";
import { handleError, createErrorContext } from "../../../common/error-handler";
import type { IEmailService } from "../../../email/services/email.service.interface";
import { UserDataExportEmail } from "../../../email/templates/UserDataExportEmail";
import { render } from "@react-email/components";
import * as React from "react";
import crypto from "node:crypto";

export class ExportDataService implements IExportDataService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly emailService: IEmailService,
  ) {}

  async createExportToken(
    userId: string,
  ): Promise<Result<{ token: string; expiresAt: Date }>> {
    try {
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // Expire in 24 hours

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          exportToken: token,
          exportExpiresAt: expiresAt,
        },
      });

      return success({ token, expiresAt });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("createExportToken", { userId }),
      );
    }
  }

  async verifyExportToken(token: string): Promise<Result<{ userId: string }>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { exportToken: token },
      });

      if (!user) {
        return failure("Lien d'export invalide", 401);
      }

      if (user.exportExpiresAt && user.exportExpiresAt < new Date()) {
        return failure("Lien d'export expiré", 410);
      }

      // Reset the token after successful verification (one-time use or prevent re-use easily)
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          exportToken: null,
          exportExpiresAt: null,
        },
      });

      return success({ userId: user.id });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("verifyExportToken", { details: { token } }),
      );
    }
  }

  async sendExportEmail(
    userId: string,
    downloadUrl: string,
    expiresAt: string,
  ): Promise<Result<{ messageId: string }>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return failure("Utilisateur non trouvé", 404);
      }

      const userName = user.displayName || user.name || "Utilisateur";

      const html = await render(
        React.createElement(UserDataExportEmail, {
          userName,
          downloadUrl,
          expiresAt,
        }),
      );

      return await this.emailService.sendEmail({
        to: user.email,
        subject: "Votre export de données personnelles LearnSup est prêt",
        html,
      });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("sendExportEmail", { userId }),
      );
    }
  }

  async exportUserData(userId: string): Promise<Result<UserDataExport>> {
    try {
      // 1. Fetch User and Account - Using internal ID (id) from session
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          accounts: true,
        },
      });

      if (!user) {
        return failure("Utilisateur non trouvé", 404);
      }

      const internalId = user.id;

      // 2. Fetch Workshops
      const workshopsAsMentor = await (this.prisma as any).workshop.findMany({
        where: { creatorId: internalId },
      });

      const workshopsAsApprentice = await (
        this.prisma as any
      ).workshop.findMany({
        where: { apprenticeId: internalId },
      });

      // 3. Fetch Workshop Requests
      const sentRequests = await (this.prisma as any).workshop_request.findMany(
        {
          where: { apprenticeId: internalId },
        },
      );

      const receivedRequests = await (
        this.prisma as any
      ).workshop_request.findMany({
        where: { mentorId: internalId },
      });

      // 4. Fetch Feedbacks
      const givenFeedbacks = await (
        this.prisma as any
      ).mentor_feedback.findMany({
        where: { apprenticeId: internalId },
      });

      const receivedFeedbacks = await (
        this.prisma as any
      ).mentor_feedback.findMany({
        where: { mentorId: internalId },
      });

      // 5. Fetch Messaging
      const conversations = await (this.prisma as any).conversation.findMany({
        where: {
          OR: [{ participant1Id: internalId }, { participant2Id: internalId }],
        },
      });

      const messages = await (this.prisma as any).message.findMany({
        where: { senderId: internalId },
      });

      // 6. Fetch Connections
      const sentConnections = await (
        this.prisma as any
      ).user_connection.findMany({
        where: { requesterId: internalId },
      });

      const receivedConnections = await (
        this.prisma as any
      ).user_connection.findMany({
        where: { receiverId: internalId },
      });

      // 7. Fetch Credits
      const transactions = await (
        this.prisma as any
      ).credit_transaction.findMany({
        where: { userId: internalId },
      });

      // 8. Fetch Notifications
      const notifications = await (this.prisma as any).notification.findMany({
        where: { userId: internalId },
      });

      // 9. Fetch Moderation
      const blocks = await (this.prisma as any).user_block.findMany({
        where: { blockerId: internalId },
      });

      const blockedBy = await (this.prisma as any).user_block.findMany({
        where: { blockedId: internalId },
      });

      const reportsMade = await (this.prisma as any).user_report.findMany({
        where: { reporterUserId: internalId },
      });

      const reportsReceived = await (this.prisma as any).user_report.findMany({
        where: { reportedUserId: internalId },
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
      return handleError(
        error,
        createErrorContext("exportUserData", { userId }),
      );
    }
  }
}
