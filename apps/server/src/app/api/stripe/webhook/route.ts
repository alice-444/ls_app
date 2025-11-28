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

          const emailResult = await container.emailService.sendEmail({
            to: user.email,
            subject: `Confirmation d'achat - ${creditsAmount} crédits`,
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background-color: #10b981; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Achat confirmé !</h1>
                  </div>
                  
                  <p>Bonjour ${user.name || "Utilisateur"},</p>
                  
                  <p>Votre achat de crédits a été confirmé avec succès. Merci pour votre confiance !</p>
                  
                  <div style="background-color: #f1f5f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Détails de la transaction :</strong></p>
                    <p style="margin: 5px 0 0 0;"><strong>Crédits achetés :</strong> ${creditsAmount} crédits</p>
                    <p style="margin: 5px 0 0 0;"><strong>Montant payé :</strong> ${amount} ${currency}</p>
                    <p style="margin: 5px 0 0 0;"><strong>N° de transaction :</strong> ${
                      creditResult.data.transactionId
                    }</p>
                    <p style="margin: 5px 0 0 0;"><strong>N° de session Stripe :</strong> ${
                      session.id
                    }</p>
                    <p style="margin: 5px 0 0 0;"><strong>Date :</strong> ${new Date().toLocaleDateString(
                      "fr-FR",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}</p>
                  </div>
                  
                  <p>Vos crédits ont été ajoutés à votre compte et sont disponibles immédiatement. Vous pouvez les utiliser pour participer aux ateliers.</p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${
                      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"
                    }/dashboard" 
                       style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                      Voir mon solde
                    </a>
                  </div>
                  
                  <p style="margin-top: 30px;">Cordialement,<br>L'équipe LearnSup</p>
                  
                  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                  <p style="font-size: 12px; color: #6b7280; text-align: center;">
                    Cet email est envoyé automatiquement, merci de ne pas y répondre.
                  </p>
                </body>
              </html>
            `,
            text: `
Achat confirmé !

Bonjour ${user.name || "Utilisateur"},

Votre achat de crédits a été confirmé avec succès. Merci pour votre confiance !

Détails de la transaction :
- Crédits achetés : ${creditsAmount} crédits
- Montant payé : ${amount} ${currency}
- N° de transaction : ${creditResult.data.transactionId}
- N° de session Stripe : ${session.id}
- Date : ${new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}

Vos crédits ont été ajoutés à votre compte et sont disponibles immédiatement. Vous pouvez les utiliser pour participer aux ateliers.

Voir mon solde : ${
              process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"
            }/dashboard

Cordialement,
L'équipe LearnSup
            `.trim(),
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
