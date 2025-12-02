import type { Result } from "../../common/types";

export interface IPolarService {
  createCheckoutSession(
    userId: string,
    credits: number,
    amount: number
  ): Promise<Result<{ url: string; sessionId: string }>>;

  verifyWebhookSignature(
    payload: string | Buffer,
    signature: string
  ): { type: string; data: any } | null;
}
