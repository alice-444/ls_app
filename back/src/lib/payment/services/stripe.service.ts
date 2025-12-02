import Stripe from "stripe";
import type { IStripeService } from "./stripe.service.interface";
import { failure, success, type Result } from "../../common/types";

export class StripeService implements IStripeService {
  private stripe: Stripe;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY environment variable is required");
    }
    this.stripe = new Stripe(secretKey, {
      apiVersion: "2025-11-17.clover",
    });
  }

  async createCheckoutSession(
    userId: string,
    credits: number,
    amount: number
  ): Promise<Result<{ url: string; sessionId: string }>> {
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: `${credits} crédits`,
                description: `Achat de ${credits} crédits pour la plateforme`,
              },
              unit_amount: Math.round(amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${baseUrl}/buy-credits?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/buy-credits?canceled=true`,
        metadata: {
          userId,
          credits: credits.toString(),
        },
        customer_email: undefined,
      });

      if (!session.url) {
        return failure("Impossible de créer la session de paiement", 500);
      }

      return success({
        url: session.url,
        sessionId: session.id,
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
  ): Stripe.Event | null {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET environment variable is required");
    }

    try {
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );
    } catch (error) {
      return null;
    }
  }
}
