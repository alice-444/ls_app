import type { Result } from "../../common/types";
import type Stripe from "stripe";

export interface IStripeService {
  createCheckoutSession(
    userId: string,
    credits: number,
    amount: number
  ): Promise<Result<{ url: string; sessionId: string }>>;

  verifyWebhookSignature(
    payload: string | Buffer,
    signature: string
  ): Stripe.Event | null;
}
