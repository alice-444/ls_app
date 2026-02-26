const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

function formatDateFr(date: Date | null): string {
  if (!date) return "Date non définie";
  return new Date(date).toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDuration(minutes: number | null): string {
  if (!minutes) return "Durée à confirmer";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h${m !== 0 ? m.toString().padStart(2, "0") : ""}`;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

function wrapHtml(headerColor: string, headerText: string, body: string): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: ${headerColor}; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
      <h1 style="color: white; margin: 0;">${headerText}</h1>
    </div>
    ${body}
    <p style="margin-top: 30px;">Cordialement,<br>L'équipe LearnSup</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    <p style="font-size: 12px; color: #6b7280; text-align: center;">
      Cet email est envoyé automatiquement, merci de ne pas y répondre.
    </p>
  </body>
</html>`;
}

function ctaButton(url: string, label: string): string {
  return `<div style="text-align: center; margin: 30px 0;">
  <a href="${url}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
    ${label}
  </a>
</div>`;
}

export class WorkshopEmailTemplates {
  static cancellation(data: {
    recipientName: string;
    apprenticeName: string;
    workshopTitle: string;
    workshopDate: Date | null;
    workshopTime: string | null;
    workshopId: string;
    cancellationReason?: string;
  }): EmailTemplate {
    const workshopDate = formatDateFr(data.workshopDate);
    const workshopTime = data.workshopTime || "Heure non définie";

    return {
      subject: `Annulation de participation - ${data.workshopTitle}`,
      html: wrapHtml(
        "#dc2626",
        "Participation annulée",
        `<p>Bonjour ${data.recipientName},</p>
        <p>Nous vous informons que <strong>${data.apprenticeName}</strong> a annulé sa participation à votre atelier.</p>
        <div style="background-color: #f1f5f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Atelier :</strong> ${data.workshopTitle}</p>
          <p style="margin: 5px 0 0 0;"><strong>Date :</strong> ${workshopDate}</p>
          <p style="margin: 5px 0 0 0;"><strong>Heure :</strong> ${workshopTime}</p>
          ${data.cancellationReason ? `<p style="margin: 10px 0 0 0;"><strong>Raison de l'annulation :</strong><br>${data.cancellationReason}</p>` : ""}
        </div>
        <p>Vous pouvez consulter les détails de l'atelier et gérer les autres demandes depuis votre tableau de bord.</p>
        ${ctaButton(`${APP_URL}/workshop/${data.workshopId}`, "Voir l'atelier")}`
      ),
      text: `Participation annulée

Bonjour ${data.recipientName},

Nous vous informons que ${data.apprenticeName} a annulé sa participation à votre atelier.

Atelier : ${data.workshopTitle}
Date : ${workshopDate}
Heure : ${workshopTime}
${data.cancellationReason ? `Raison de l'annulation : ${data.cancellationReason}` : ""}

Voir l'atelier : ${APP_URL}/workshop/${data.workshopId}

Cordialement,
L'équipe LearnSup`,
    };
  }

  static requestAccepted(data: {
    recipientName: string;
    mentorName: string;
    workshopTitle: string;
    workshopDate: Date | null;
    workshopTime: string | null;
    workshopDuration: number | null;
    workshopLocation: string | null;
    isVirtual: boolean;
    workshopId: string;
  }): EmailTemplate {
    const workshopDate = formatDateFr(data.workshopDate);
    const workshopTime = data.workshopTime || "Heure à confirmer";
    const workshopDuration = formatDuration(data.workshopDuration);
    const workshopLocation = data.isVirtual
      ? "Atelier en ligne (virtuel)"
      : data.workshopLocation || "Lieu à confirmer";

    return {
      subject: `Demande acceptée - ${data.workshopTitle}`,
      html: wrapHtml(
        "#10b981",
        "Demande acceptée !",
        `<p>Bonjour ${data.recipientName},</p>
        <p>Excellente nouvelle ! <strong>${data.mentorName}</strong> a accepté votre demande pour l'atelier <strong>"${data.workshopTitle}"</strong>.</p>
        <div style="background-color: #dbeafe; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #3b82f6;">
          <p style="margin: 0; font-weight: bold; color: #1e40af;">Détails de l'atelier :</p>
          <p style="margin: 5px 0 0 0;"><strong>Date :</strong> ${workshopDate}</p>
          <p style="margin: 5px 0 0 0;"><strong>Heure :</strong> ${workshopTime}</p>
          <p style="margin: 5px 0 0 0;"><strong>Durée :</strong> ${workshopDuration}</p>
          <p style="margin: 5px 0 0 0;"><strong>Lieu :</strong> ${workshopLocation}</p>
          <p style="margin: 5px 0 0 0;"><strong>Mentor :</strong> ${data.mentorName}</p>
        </div>
        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981;">
          <p style="margin: 0; font-weight: bold;">Prochaines étapes :</p>
          <ul style="margin: 5px 0 0 0; padding-left: 20px;">
            <li>Ajoutez cet atelier à votre calendrier</li>
            <li>Préparez vos questions et vos notes</li>
            <li>Consultez les détails de l'atelier pour plus d'informations</li>
          </ul>
        </div>
        <p>Nous vous souhaitons un excellent atelier !</p>
        ${ctaButton(`${APP_URL}/workshop/${data.workshopId}`, "Voir les détails de l'atelier")}`
      ),
      text: `Demande acceptée !

Bonjour ${data.recipientName},

Excellente nouvelle ! ${data.mentorName} a accepté votre demande pour l'atelier "${data.workshopTitle}".

Détails de l'atelier :
- Date : ${workshopDate}
- Heure : ${workshopTime}
- Durée : ${workshopDuration}
- Lieu : ${workshopLocation}
- Mentor : ${data.mentorName}

Prochaines étapes :
- Ajoutez cet atelier à votre calendrier
- Préparez vos questions et vos notes
- Consultez les détails de l'atelier pour plus d'informations

Voir les détails : ${APP_URL}/workshop/${data.workshopId}

Cordialement,
L'équipe LearnSup`,
    };
  }

  static requestRejected(data: {
    recipientName: string;
    mentorName: string;
    workshopTitle: string;
  }): EmailTemplate {
    return {
      subject: `Demande d'atelier rejetée - ${data.workshopTitle}`,
      html: wrapHtml(
        "#f59e0b",
        "Demande rejetée",
        `<p>Bonjour ${data.recipientName},</p>
        <p>Nous vous informons que <strong>${data.mentorName}</strong> a rejeté votre demande pour l'atelier <strong>"${data.workshopTitle}"</strong>.</p>
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; font-weight: bold;">Ne vous découragez pas !</p>
          <p style="margin: 5px 0 0 0;">Il existe de nombreux autres ateliers qui pourraient vous intéresser. Continuez à explorer et à faire de nouvelles demandes.</p>
        </div>
        <p>Vous pouvez consulter d'autres ateliers disponibles et faire de nouvelles demandes depuis votre tableau de bord.</p>
        ${ctaButton(`${APP_URL}/workshop-room`, "Voir les ateliers disponibles")}`
      ),
      text: `Demande rejetée

Bonjour ${data.recipientName},

Nous vous informons que ${data.mentorName} a rejeté votre demande pour l'atelier "${data.workshopTitle}".

Ne vous découragez pas !
Il existe de nombreux autres ateliers qui pourraient vous intéresser.

Voir les ateliers disponibles : ${APP_URL}/workshop-room

Cordialement,
L'équipe LearnSup`,
    };
  }
}
