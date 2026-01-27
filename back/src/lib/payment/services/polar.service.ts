import type { IPolarService } from "./polar.service.interface";
import { failure, success, type Result } from "../../common/types";

export class PolarService implements IPolarService {
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor() {
    const apiKey = process.env.POLAR_API_KEY;
    if (!apiKey) {
      throw new Error("POLAR_API_KEY environment variable is required");
    }
    this.apiKey = apiKey;
    this.apiUrl = process.env.POLAR_API_URL || "https://api.polar.sh";
  }

  async createCheckoutSession(
    userId: string,
    credits: number,
    amount: number
  ): Promise<Result<{ url: string; sessionId: string }>> {
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

      const response = await fetch(`${this.apiUrl}/v1/checkouts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          product_id: process.env.POLAR_PRODUCT_ID,
          success_url: `${baseUrl}/buy-credits?success=true&checkout_id={CHECKOUT_ID}`,
          cancel_url: `${baseUrl}/buy-credits?canceled=true`,
          metadata: {
            userId,
            credits: credits.toString(),
            amount: amount.toString(),
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return failure(
          `Erreur lors de la création de la session: ${
            errorData.message || response.statusText
          }`,
          500
        );
      }

      const data = await response.json();

      if (!data.url || !data.id) {
        return failure("Impossible de créer la session de paiement", 500);
      }

      return success({
        url: data.url,
        sessionId: data.id,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erreur inconnue";
      return failure(
        `Erreur lors de la création de la session: ${errorMessage}`,
        500
      );
    }
  }

  verifyWebhookSignature(
    payload: string | Buffer,
    signature: string
  ): { type: string; data: any } | null {
    const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("POLAR_WEBHOOK_SECRET environment variable is required");
    }

    try {
      // Polar.sh webhook signature verification
      const crypto = require("node:crypto");
      const payloadString =
        typeof payload === "string" ? payload : payload.toString();
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(payloadString)
        .digest("hex");

      if (signature !== expectedSignature) {
        return null;
      }

      const event = JSON.parse(payloadString);
      return event as { type: string; data: any };
    } catch (error) {
      // Invalid signature or malformed JSON
      console.error("Webhook signature verification failed:", error);
      return null;
    }
  }
}
