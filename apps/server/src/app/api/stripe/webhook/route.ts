import { NextRequest, NextResponse } from "next/server";
import { container } from "@/lib/di/container";
import { StripeService } from "@/lib/payment/services/stripe.service";

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
      const session = event.data.object;

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

      const creditsAmount = Number.parseInt(credits, 10);
      if (Number.isNaN(creditsAmount) || creditsAmount <= 0) {
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

      try {
        const user = await container.prisma.user.findUnique({
          where: { id: userId },
          select: { email: true, name: true },
        });

        if (user?.email) {
          const amount = session.amount_total
            ? (session.amount_total / 100).toFixed(2)
            : "N/A";
          const currency = session.currency?.toUpperCase() || "EUR";

          const { renderEmailTemplate } = await import("../../../../lib/email/utils/render-email");
          const { CreditPurchaseConfirmation } = await import("../../../../lib/email/templates/CreditPurchaseConfirmation");
          const React = await import("react");

          const emailContent = await renderEmailTemplate(
            React.createElement(CreditPurchaseConfirmation, {
              userName: user.name || "Utilisateur",
              creditsAmount,
              amount,
              currency,
              transactionId: creditResult.data.transactionId,
              stripeSessionId: session.id,
              date: new Date().toLocaleDateString("fr-FR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }),
            })
          );

          const emailResult = await container.emailService.sendEmail({
            to: user.email,
            subject: `Confirmation d'achat - ${creditsAmount} crédits`,
            html: emailContent.html,
            text: emailContent.text,
          });

          if (!emailResult.ok) {
            console.error("Failed to send purchase confirmation email", {
              userId,
              email: user.email,
              error: emailResult.error,
            });
          }
        }
      } catch (error) {
        console.error("Error sending purchase confirmation email", {
          userId,
          error,
        });
      }

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
