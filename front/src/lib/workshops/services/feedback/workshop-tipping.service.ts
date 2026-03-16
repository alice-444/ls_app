import type { IWorkshopTippingService } from "./workshop-tipping.service.interface";
import type { ICreditService } from "../../../credits/services/credit.service.interface";
import type { Result } from "../../../common";
import { success, failure } from "../../../common";
import { logger } from "../../../common/logger";
import type { PrismaClient } from "../../../prisma-server";
import type { IEmailService } from "../../../email/services/email.service.interface";
import { renderEmailTemplate } from "../../../email/utils/render-email";
import { TippingReceivedEmail } from "../../../email/templates/TippingReceivedEmail";
import * as React from "react";

export class WorkshopTippingService implements IWorkshopTippingService {
  constructor(
    private readonly creditService: ICreditService,
    private readonly prisma: PrismaClient,
    private readonly emailService?: IEmailService,
  ) {}

  async sendTip(
    fromUserId: string,
    toMentorUserId: string,
    amount: number,
    workshopTitle?: string,
  ): Promise<Result<{ success: boolean; newBalance: number }>> {
    try {
      if (amount < 1 || amount > 100) {
        return failure(
          "Le montant du pourboire doit être de 1 à 100 crédits.",
          400,
        );
      }

      const balanceCheck = await this.creditService.checkBalance(
        fromUserId,
        amount,
      );

      if (!balanceCheck.ok) {
        return balanceCheck;
      }

      if (!balanceCheck.data.hasEnough) {
        return failure(
          `Crédits insuffisants. Vous avez ${balanceCheck.data.balance} crédit${
            balanceCheck.data.balance > 1 ? "s" : ""
          } mais ${amount} crédit${amount > 1 ? "s" : ""} sont requis.`,
          400,
        );
      }

      const debitResult = await this.creditService.debitCredits(
        fromUserId,
        amount,
        `Pourboire pour mentor - ${amount} crédit${amount > 1 ? "s" : ""}`,
      );

      if (!debitResult.ok) {
        return failure(
          `Erreur lors du débit: ${debitResult.error}`,
          debitResult.status || 500,
        );
      }

      const creditResult = await this.creditService.creditCredits(
        toMentorUserId,
        amount,
        `Pourboire reçu - ${amount} crédit${amount > 1 ? "s" : ""}`,
      );

      if (!creditResult.ok) {
        logger.error("Failed to credit tip to mentor, rolling back", {
          fromUserId,
          toMentorUserId,
          amount,
          error: creditResult.error,
        });
        await this.creditService.creditCredits(
          fromUserId,
          amount,
          `Remboursement - Erreur lors du pourboire`,
        );
        return failure(
          `Erreur lors du crédit au mentor: ${creditResult.error}`,
          creditResult.status || 500,
        );
      }

      logger.info("Tip sent successfully", {
        fromUserId,
        toMentorUserId,
        amount,
        newBalance: debitResult.data.newBalance,
      });

      // Send email notification to mentor (async)
      this.sendTippingEmail(
        fromUserId,
        toMentorUserId,
        amount,
        workshopTitle || "votre atelier",
      ).catch((err) =>
        logger.error("Failed to send tipping email", {
          toMentorUserId,
          error: err,
        }),
      );

      return success({
        success: true,
        newBalance: debitResult.data.newBalance,
      });
    } catch (error) {
      logger.error("Error sending tip", error, {
        fromUserId,
        toMentorUserId,
        amount,
      });
      return failure(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'envoi du pourboire",
        500,
      );
    }
  }

  private async sendTippingEmail(
    fromUserId: string,
    toMentorUserId: string,
    amount: number,
    workshopTitle: string,
  ): Promise<void> {
    if (!this.emailService) return;

    try {
      const [fromUser, toMentor] = await Promise.all([
        this.prisma.user.findUnique({
          where: { id: fromUserId },
          select: { name: true, displayName: true },
        }),
        this.prisma.user.findUnique({
          where: { id: toMentorUserId },
          select: { name: true, displayName: true, email: true },
        }),
      ]);

      if (!toMentor?.email) return;

      const apprenticeName =
        fromUser?.displayName || fromUser?.name || "un apprenant";
      const mentorName = toMentor?.displayName || toMentor?.name || "Mentor";

      const { html, text } = await renderEmailTemplate(
        React.createElement(TippingReceivedEmail, {
          mentorName,
          apprenticeName,
          amount,
          workshopTitle,
        }),
      );

      const emailResult = await this.emailService.sendEmail({
        to: toMentor.email,
        subject: `Vous avez reçu un pourboire de ${amount} crédits !`,
        html,
        text,
      });

      if (!emailResult.ok) {
        logger.error("Failed to send tipping email", {
          toMentorUserId,
          error: emailResult.error,
        });
      }
    } catch (error) {
      logger.error("Error in sendTippingEmail", { toMentorUserId, error });
    }
  }
}
