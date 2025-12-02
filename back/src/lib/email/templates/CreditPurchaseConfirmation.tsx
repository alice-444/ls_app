import { Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./EmailLayout";

interface CreditPurchaseConfirmationProps {
  readonly userName: string;
  readonly creditsAmount: number;
  readonly amount: string;
  readonly currency: string;
  readonly transactionId: string;
  readonly stripeSessionId: string;
  readonly date: string;
}

export function CreditPurchaseConfirmation({
  userName,
  creditsAmount,
  amount,
  currency,
  transactionId,
  stripeSessionId,
  date,
}: CreditPurchaseConfirmationProps) {
  return (
    <EmailLayout
      preview="Achat confirmé !"
      title="Achat confirmé !"
      headerColor="#10b981"
    >
      <Text>Bonjour {userName || "Utilisateur"},</Text>
      <Text>
        Votre achat de crédits a été confirmé avec succès. Merci pour votre
        confiance !
      </Text>
      <Section style={infoBox}>
        <Text style={infoTitle}>Détails de la transaction :</Text>
        <Text style={infoText}>
          <strong>Crédits achetés :</strong> {creditsAmount} crédits
        </Text>
        <Text style={infoText}>
          <strong>Montant payé :</strong> {amount} {currency}
        </Text>
        <Text style={infoText}>
          <strong>N° de transaction :</strong> {transactionId}
        </Text>
        <Text style={infoText}>
          <strong>N° de session Stripe :</strong> {stripeSessionId}
        </Text>
        <Text style={infoText}>
          <strong>Date :</strong> {date}
        </Text>
      </Section>
      <Text>
        Vous pouvez maintenant utiliser vos crédits pour participer aux ateliers
        ou créer vos propres sessions.
      </Text>
    </EmailLayout>
  );
}

const infoBox = {
  backgroundColor: "#f1f5f9",
  padding: "15px",
  borderRadius: "5px",
  margin: "20px 0",
};

const infoTitle = {
  margin: "0 0 10px 0",
  fontWeight: "bold",
};

const infoText = {
  margin: "5px 0",
};
