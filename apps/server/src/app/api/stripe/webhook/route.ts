import { NextRequest, NextResponse } from "next/server";
import { container } from "@/lib/di/container";
import { StripeService } from "@/lib/payment/services/stripe.service";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    const stripeService = new StripeService();
    const event = stripeService.verifyWebhookSignature(body, signature);

    if (!event) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 }
      );
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId = session.metadata?.userId;
      const credits = session.metadata?.credits;

      if (!userId || !credits) {
        console.error("Missing metadata in Stripe session", {
          sessionId: session.id,
          metadata: session.metadata,
        });
        return NextResponse.json(
          { error: "Missing required metadata" },
          { status: 400 }
        );
      }

      const creditsAmount = parseInt(credits, 10);
      if (isNaN(creditsAmount) || creditsAmount <= 0) {
        console.error("Invalid credits amount", { credits });
        return NextResponse.json(
          { error: "Invalid credits amount" },
          { status: 400 }
        );
      }

      if (session.payment_status !== "paid") {
        console.warn("Session not paid", {
          sessionId: session.id,
          paymentStatus: session.payment_status,
        });
        return NextResponse.json(
          { error: "Payment not completed" },
          { status: 400 }
        );
      }

      const creditResult = await container.creditService.creditCredits(
        userId,
        creditsAmount,
        `Achat de ${creditsAmount} crédits via Stripe (Session: ${session.id})`
      );

      if (!creditResult.ok) {
        console.error("Failed to credit credits", {
          userId,
          credits: creditsAmount,
          error: creditResult.error,
        });
        return NextResponse.json(
          { error: "Failed to credit credits" },
          { status: 500 }
        );
      }

      console.log("Credits credited successfully", {
        userId,
        credits: creditsAmount,
        transactionId: creditResult.data.transactionId,
        sessionId: session.id,
      });

      return NextResponse.json({
        success: true,
        credits: creditsAmount,
        transactionId: creditResult.data.transactionId,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
