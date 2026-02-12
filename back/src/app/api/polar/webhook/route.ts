import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.DATABASE_URL && !process.env.PRISMA_ACCELERATE_URL) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Lazy-load dependencies
    const { container } = await import("@/lib/di/container");
    const { PolarService } = await import("@/lib/payment/services/polar.service");

    const body = await req.text();
    const signature =
      req.headers.get("polar-signature") || req.headers.get("x-polar-signature") || req.headers.get("signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing webhook signature header" }, { status: 400 });
    }

    const polarService = new PolarService();
    const event = polarService.verifyWebhookSignature(body, signature);

    if (!event) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    // Polar.sh webhook event types
    if (event.type === "checkout.succeeded" || event.type === "checkout.completed") {
      const checkout = event.data;

      const userId = checkout.metadata?.userId;
      const credits = checkout.metadata?.credits;

      if (!userId || !credits) {
        console.error("Missing metadata in Polar checkout", {
          checkoutId: checkout.id,
          metadata: checkout.metadata,
        });
        return NextResponse.json({ error: "Missing required metadata" }, { status: 400 });
      }

      const creditsAmount = Number.parseInt(credits, 10);
      if (Number.isNaN(creditsAmount) || creditsAmount <= 0) {
        console.error("Invalid credits amount", { credits });
        return NextResponse.json({ error: "Invalid credits amount" }, { status: 400 });
      }

      if (checkout.status !== "paid" && checkout.status !== "succeeded") {
        console.warn("Checkout not paid", {
          checkoutId: checkout.id,
          status: checkout.status,
        });
        return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
      }

      const creditResult = await container.creditService.creditCredits(
        userId,
        creditsAmount,
        `Achat de ${creditsAmount} crédits via Polar.sh (Checkout: ${checkout.id})`,
      );

      if (!creditResult.ok) {
        console.error("Failed to credit credits", {
          userId,
          credits: creditsAmount,
          error: creditResult.error,
        });
        return NextResponse.json({ error: "Failed to credit credits" }, { status: 500 });
      }

      console.log("Credits credited successfully", {
        userId,
        credits: creditsAmount,
        transactionId: creditResult.data.transactionId,
        checkoutId: checkout.id,
      });

      try {
        const user = await container.prisma.user.findUnique({
          where: { id: userId },
          select: { email: true, name: true },
        });

        if (user?.email) {
          const amount = checkout.amount_total
            ? (checkout.amount_total / 100).toFixed(2)
            : checkout.metadata?.amount || "N/A";
          const currency = checkout.currency?.toUpperCase() || "EUR";

          const { renderEmailTemplate } = await import("../../../../lib/email/utils/render-email");
          const { CreditPurchaseConfirmation } =
            await import("../../../../lib/email/templates/CreditPurchaseConfirmation");
          const React = await import("react");

          const emailContent = await renderEmailTemplate(
            React.createElement(CreditPurchaseConfirmation, {
              userName: user.name || "Utilisateur",
              creditsAmount,
              amount,
              currency,
              transactionId: creditResult.data.transactionId,
              polarCheckoutId: checkout.id,
              date: new Date().toLocaleDateString("fr-FR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }),
            }),
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
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
